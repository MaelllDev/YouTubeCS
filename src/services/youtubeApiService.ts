import type { ChannelInfo } from '../types'
import { parseYouTubeInput } from '../utils/youtube'

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'
// Public CORS proxy to use as fallback when YouTube blocks direct requests
const CORS_PROXY = 'https://api.allorigins.win/raw?url='

interface YouTubeApiChannelResponse {
  items?: Array<{
    id: string
    snippet: {
      title: string
      customUrl?: string
      thumbnails: {
        default: { url: string; width: number; height: number }
        medium: { url: string; width: number; height: number }
        high: { url: string; width: number; height: number }
      }
    }
  }>
  error?: {
    code: number
    message: string
    errors?: Array<{ reason: string; message: string }>
  }
}

// ─── YouTube Data API v3 (requer API Key) ────────────────────────────────

export async function searchChannelViaYouTube(
  input: string,
  apiKey: string
): Promise<{ channel: ChannelInfo | null; error?: string }> {
  const handle = parseYouTubeInput(input)
  if (!handle) return { channel: null, error: 'Não foi possível identificar o canal nesta URL.' }

  try {
    const cleanHandle = handle.replace('@', '')
    const url = `${YOUTUBE_API_BASE}/channels?part=snippet&forHandle=${encodeURIComponent(cleanHandle)}&key=${encodeURIComponent(apiKey)}`

    const response = await fetch(url)
    const data: YouTubeApiChannelResponse = await response.json()

    if (data.error) {
      const isAuthError = data.error.code === 403 || data.error.code === 400
      const errorMsg = isAuthError
        ? 'Chave API inválida ou cota excedida. Verifique sua chave no Google Cloud Console.'
        : `Erro da API: ${data.error.message}`
      console.warn('[YouTube API] Error:', data.error.message)
      return { channel: null, error: errorMsg }
    }

    if (!data.items || data.items.length === 0) {
      return { channel: null, error: 'Canal não encontrado no YouTube.' }
    }

    const channel = data.items[0]
    const snippet = channel.snippet

    const avatarUrl = snippet.thumbnails.high?.url
      || snippet.thumbnails.medium?.url
      || snippet.thumbnails.default?.url
      || ''

    return {
      channel: {
        id: channel.id,
        name: snippet.title,
        handle: snippet.customUrl
          ? `@${snippet.customUrl.replace('@', '')}`
          : handle,
        avatarUrl,
        verified: true,
      },
    }
  } catch (err) {
    console.warn('[YouTube API] Network error:', err)
    return { channel: null, error: 'Erro de rede ao conectar com o YouTube. Verifique sua conexão.' }
  }
}

// ─── Utility: fetch com timeout ──────────────────────────────────────────

async function fetchWithTimeout(url: string, timeoutMs = 5000, options?: RequestInit): Promise<Response | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
    const response = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(timeoutId)
    return response
  } catch {
    return null
  }
}

// ─── Método 2: Feed RSS do YouTube ──────────────────────────────────────
// URL: https://www.youtube.com/feeds/videos.xml?channel_id=UC...
// Extrai somentes o nome do canal do feed RSS (a foto não está disponível aqui).
// Obs: Pode ser bloqueado por CORS em alguns navegadores.

async function searchViaRssFeed(
  input: string
): Promise<{ channel: ChannelInfo | null; error?: string }> {
  const handle = parseYouTubeInput(input)
  if (!handle) return { channel: null, error: 'URL inválida' }

  try {
    // Primeiro, tenta buscar a página do canal para extrair o channel ID
    const channelId = await extractChannelIdFromPage(handle)
    if (!channelId) {
      return { channel: null, error: 'Não foi possível obter o ID do canal.' }
    }

    // Tenta buscar o feed RSS
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
    let xmlText: string | null = null

    // Tenta fetch direto primeiro (com timeout)
    const directResponse = await fetchWithTimeout(feedUrl)
    if (directResponse?.ok) {
      xmlText = await directResponse.text()
    }

    // Se falhou, tenta via proxy CORS (com timeout)
    if (!xmlText) {
      const proxyResponse = await fetchWithTimeout(`${CORS_PROXY}${encodeURIComponent(feedUrl)}`)
      if (proxyResponse?.ok) {
        xmlText = await proxyResponse.text()
      }
    }

    if (!xmlText) {
      return { channel: null, error: 'Feed RSS bloqueado pelo CORS do navegador.' }
    }

    // Extrai o nome do canal do XML (única informação confiável do feed)
    const nameMatch = xmlText.match(/<name>([^<]+)<\/name>/)
    const channelName = nameMatch ? nameMatch[1] : handle.replace('@', '')

    // A foto de perfil NÃO está disponível no feed RSS.
    // O <media:thumbnail> no feed é a thumbnail dos VÍDEOS, não do canal.
    // A URL do yt3.ggpht.com não pode ser construída sem dados da API.
    // Deixamos avatarUrl vazio para o fallback do componente Avatar
    // (que mostra iniciais inline quando não há imagem).

    return {
      channel: {
        id: channelId,
        name: channelName,
        handle,
        avatarUrl: '',
        verified: false,
      },
    }
  } catch (err) {
    console.warn('[RSS Feed] Error:', err)
    return { channel: null, error: 'Erro ao processar feed RSS.' }
  }
}

// ─── Método 3: Scraping de Meta Tags da Página HTML ─────────────────────
// Faz scraping da página do canal (youtube.com/@handle/about) para extrair
// a meta tag og:image que contém a URL da foto de perfil.
// Obs: Geralmente bloqueado por CORS, mas pode funcionar via proxy.

async function searchViaHtmlScraping(
  input: string
): Promise<{ channel: ChannelInfo | null; error?: string }> {
  const handle = parseYouTubeInput(input)
  if (!handle) return { channel: null, error: 'URL inválida' }

  try {
    const cleanHandle = handle.replace('@', '')
    const pageUrl = `https://www.youtube.com/@${cleanHandle}/about`

    let html: string | null = null

    // Tenta fetch direto primeiro (geralmente bloqueado por CORS, com timeout)
    const directResponse = await fetchWithTimeout(pageUrl, 5000, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml',
        'User-Agent': 'Mozilla/5.0 (compatible; YCS/1.0)',
      },
    })
    if (directResponse?.ok) {
      html = await directResponse.text()
    }

    // Se falhou, tenta via proxy CORS (com timeout)
    if (!html) {
      const proxyResponse = await fetchWithTimeout(`${CORS_PROXY}${encodeURIComponent(pageUrl)}`)
      if (proxyResponse?.ok) {
        html = await proxyResponse.text()
      }
    }

    if (!html) {
      return { channel: null, error: 'Página do canal bloqueada por CORS.' }
    }

    // Extrai a URL do avatar da meta tag og:image
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/)
    const avatarUrl = ogImageMatch ? ogImageMatch[1] : ''

    // Extrai o nome do canal
    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/)
    const channelName = ogTitleMatch ? ogTitleMatch[1] : handle.replace('@', '')

    // Extrai o channel ID do HTML (presente em ytInitialData ou meta tags)
    const channelId = await extractChannelIdFromHtml(html, handle)

    return {
      channel: {
        id: channelId || `UC_${Math.random().toString(36).slice(2, 10)}`,
        name: channelName,
        handle,
        avatarUrl,
        verified: false,
      },
    }
  } catch (err) {
    console.warn('[HTML Scrape] Error:', err)
    return { channel: null, error: 'Erro ao processar página do canal.' }
  }
}

// ─── Utilitários ─────────────────────────────────────────────────────────

/**
 * Tenta extrair o channel ID (UC...) da página do YouTube.
 * Tenta: (1) página direta, (2) proxy CORS, (3) padrões conhecidos na URL.
 */
async function extractChannelIdFromPage(handle: string): Promise<string | null> {
  const cleanHandle = handle.replace('@', '')
  const pageUrl = `https://www.youtube.com/@${cleanHandle}`

  let html: string | null = null

  // Tenta fetch direto (com timeout)
  const directResponse = await fetchWithTimeout(pageUrl, 5000, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; YCS/1.0)' },
  })
  if (directResponse?.ok) html = await directResponse.text()

  // Tenta via proxy (com timeout)
  if (!html) {
    const proxyResponse = await fetchWithTimeout(`${CORS_PROXY}${encodeURIComponent(pageUrl)}`)
    if (proxyResponse?.ok) html = await proxyResponse.text()
  }

  if (html) {
    return extractChannelIdFromHtml(html, handle)
  }

  return null
}

/**
 * Extrai o channel ID do HTML da página do YouTube.
 * Procura em: ytInitialData, meta tags, externalId, etc.
 */
function extractChannelIdFromHtml(html: string, handle: string): string | null {
  // Tenta extrair do ytInitialData (embedded JSON)
  const ytDataMatch = html.match(/ytInitialData\s*=\s*({[^;]+});/)
  if (ytDataMatch) {
    try {
      const data = JSON.parse(ytDataMatch[1])
      const channelId = data?.metadata?.channelMetadataRenderer?.externalId
        || data?.header?.c4TabbedHeaderRenderer?.channelId
        || data?.microformat?.microformatDataRenderer?.externalId
      if (channelId && channelId.startsWith('UC')) return channelId
    } catch { /* JSON parse failed */ }
  }

  // Tenta extrair de meta tags
  const channelIdMeta = html.match(/<meta[^>]+itemprop=["']channelId["'][^>]+content=["']([^"']+)["']/)
  if (channelIdMeta) return channelIdMeta[1]

  // Tenta extrair de URLs canônicas
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']https:\/\/www\.youtube\.com\/channel\/(UC[\w-]+)["']/)
  if (canonicalMatch) return canonicalMatch[1]

  // Tenta extrair de og:url
  const ogUrlMatch = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']https:\/\/www\.youtube\.com\/channel\/(UC[\w-]+)["']/)
  if (ogUrlMatch) return ogUrlMatch[1]

  return null
}

// ─── Função principal: tenta todos os métodos em cascata ─────────────────

export async function searchChannelAnyMethod(
  input: string,
  apiKey?: string
): Promise<{ channel: ChannelInfo | null; method: 'api' | 'rss' | 'html' | null; error?: string }> {
  const handle = parseYouTubeInput(input)
  if (!handle) return { channel: null, method: null, error: 'Não foi possível identificar o canal nesta URL.' }

  // 1º: YouTube Data API v3 (requer API Key)
  if (apiKey) {
    try {
      const result = await searchChannelViaYouTube(input, apiKey)
      if (result.channel) return { channel: result.channel, method: 'api' }
      // Se a API retornou erro de autenticação, não tenta os outros métodos
      if (result.error?.includes('Chave API')) {
        return { channel: null, method: null, error: result.error }
      }
    } catch { /* fall through */ }
  }

  // 2º: Feed RSS do YouTube (sem API Key)
  try {
    const result = await searchViaRssFeed(input)
    if (result.channel?.avatarUrl) return { channel: result.channel, method: 'rss' }
  } catch { /* fall through */ }

  // 3º: Scraping de Meta Tags HTML (sem API Key)
  try {
    const result = await searchViaHtmlScraping(input)
    if (result.channel?.avatarUrl) return { channel: result.channel, method: 'html' }
  } catch { /* fall through */ }

  // Nenhum método funcionou
  return { channel: null, method: null, error: 'Não foi possível buscar o canal. Tente usar uma API Key.' }
}
