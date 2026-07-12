import type { ChannelInfo } from '../types'

const mockChannels: Record<string, ChannelInfo> = {
  '@lofi': {
    id: 'UCvH1e0z8sGQ',
    name: 'Lofi Girl',
    handle: '@lofi',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lofi&backgroundColor=b6e3f4',
    verified: true,
  },
  '@tech': {
    id: 'UC_TECH',
    name: 'Tech Review',
    handle: '@tech',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tech&backgroundColor=c0aede',
    verified: true,
  },
  '@gamer': {
    id: 'UC_GAMER',
    name: 'GamePlay BR',
    handle: '@gamer',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gamer&backgroundColor=ffdfbf',
    verified: false,
  },
  '@music': {
    id: 'UC_MUSIC',
    name: 'Música & Som',
    handle: '@music',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=music&backgroundColor=d1d4f9',
    verified: true,
  },
  '@dev': {
    id: 'UC_DEV',
    name: 'Coding Tips',
    handle: '@dev',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev&backgroundColor=ffd5dc',
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
      resolve({
        id: `UC_${Math.random().toString(36).slice(2, 10)}`,
        name: parsed.handle.replace('@', '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        handle: parsed.handle.startsWith('@') ? parsed.handle : `@${parsed.handle}`,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${parsed.handle}&backgroundColor=ffdfbf,c0aede,b6e3f4,d1d4f9`,
        verified: Math.random() > 0.5,
      })
    }, 600)
  })
}
