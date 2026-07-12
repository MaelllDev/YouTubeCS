import type { ChannelInfo } from '../types'
import { searchChannelAnyMethod } from './youtubeApiService'
import { parseYouTubeInput } from '../utils/youtube'

const STORAGE_KEY = 'ycs-youtube-api-key'

export function getYouTubeApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

export function setYouTubeApiKey(key: string): void {
  try {
    if (key) {
      localStorage.setItem(STORAGE_KEY, key)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // localStorage might be unavailable
  }
}

const mockChannels: Record<string, ChannelInfo> = {
  '@lofi': {
    id: 'UCvH1e0z8sGQ',
    name: 'Lofi Girl',
    handle: '@lofi',
    avatarUrl: 'https://ui-avatars.com/api/?name=Lofi+Girl&background=ff4444&color=fff&bold=true&size=80',
    verified: true,
  },
  '@tech': {
    id: 'UC_TECH',
    name: 'Tech Review',
    handle: '@tech',
    avatarUrl: 'https://ui-avatars.com/api/?name=Tech+Review&background=cc0000&color=fff&bold=true&size=80',
    verified: true,
  },
  '@gamer': {
    id: 'UC_GAMER',
    name: 'GamePlay BR',
    handle: '@gamer',
    avatarUrl: 'https://ui-avatars.com/api/?name=GamePlay+BR&background=333333&color=ff4444&bold=true&size=80',
    verified: false,
  },
  '@music': {
    id: 'UC_MUSIC',
    name: 'Música & Som',
    handle: '@music',
    avatarUrl: 'https://ui-avatars.com/api/?name=Musica+e+Som&background=ff4444&color=fff&bold=true&size=80',
    verified: true,
  },
  '@dev': {
    id: 'UC_DEV',
    name: 'Coding Tips',
    handle: '@dev',
    avatarUrl: 'https://ui-avatars.com/api/?name=Coding+Tips&background=1a1a1a&color=ff4444&bold=true&size=80',
    verified: false,
  },
}

function parseInput(input: string): { handle: string } | null {
  const handle = parseYouTubeInput(input)
  if (!handle) return null
  return { handle }
}

export async function searchChannel(
  input: string,
  apiKey?: string
): Promise<{ channel: ChannelInfo | null; fromApi: boolean; error?: string }> {
  const parsed = parseInput(input)
  if (!parsed) return { channel: null, fromApi: false }

  // Tries cascade: YouTube API → RSS Feed → HTML Scraping
  // All methods are attempted regardless of whether an API key is provided
  try {
    const result = await searchChannelAnyMethod(input, apiKey || undefined)
    if (result.channel) {
      return {
        channel: result.channel,
        fromApi: result.method !== null, // true if ANY method worked
        error: undefined,
      }
    }
    // All methods failed — pass through the error
    const errorMsg = result.error || 'Não foi possível encontrar este canal.'
    return { channel: null, fromApi: true, error: errorMsg }
  } catch {
    // Fall through to mock
  }

  // Fallback to mock data (immediate, no delay)
  const channel = mockChannels[parsed.handle.toLowerCase()]
  if (channel) {
    return { channel, fromApi: false }
  }

  // Generate a random channel from the input
  const name = parsed.handle.replace('@', '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return {
    channel: {
      id: `UC_${Math.random().toString(36).slice(2, 10)}`,
      name,
      handle: parsed.handle.startsWith('@') ? parsed.handle : `@${parsed.handle}`,
      avatarUrl: '',
      verified: Math.random() > 0.5,
    },
    fromApi: false,
  }
}
