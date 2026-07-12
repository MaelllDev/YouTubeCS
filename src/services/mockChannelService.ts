import type { ChannelInfo } from '../types'

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
  if (!input.trim()) return null

  // Handle URLs like https://youtube.com/@username
  const urlMatch = input.match(/youtube\.com\/(@[\w.-]+)/)
  if (urlMatch) return { handle: urlMatch[1] }

  // Handle URLs like https://youtube.com/channel/UC...
  const channelMatch = input.match(/youtube\.com\/channel\/(UC[\w-]+)/)
  if (channelMatch) return { handle: `@channel-${channelMatch[1].slice(0, 8)}` }

  // Handle @username format
  const mentionMatch = input.match(/^@?([\w.-]+)$/)
  if (mentionMatch) return { handle: `@${mentionMatch[1]}` }

  return null
}

export function searchChannel(input: string): Promise<ChannelInfo | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const parsed = parseInput(input)
      if (!parsed) {
        resolve(null)
        return
      }

      const channel = mockChannels[parsed.handle.toLowerCase()]
      if (channel) {
        resolve(channel)
        return
      }

      // Generate a random channel from the input
      const name = parsed.handle.replace('@', '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      resolve({
        id: `UC_${Math.random().toString(36).slice(2, 10)}`,
        name,
        handle: parsed.handle.startsWith('@') ? parsed.handle : `@${parsed.handle}`,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ff4444&color=fff&bold=true&size=80`,
        verified: Math.random() > 0.5,
      })
    }, 600)
  })
}
