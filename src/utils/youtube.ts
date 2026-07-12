/**
 * Parse a YouTube URL or handle to extract the @handle
 */
export function parseYouTubeInput(input: string): string | null {
  if (!input.trim()) return null

  // Handle URLs like https://youtube.com/@username or https://youtube.com/@username?si=...
  const urlMatch = input.match(/youtube\.com\/(@[\w.-]+)/)
  if (urlMatch) {
    // Remove query params if any got captured
    const handle = urlMatch[1].split('?')[0]
    return handle
  }

  // Handle URLs like https://youtube.com/channel/UC...
  const channelMatch = input.match(/youtube\.com\/channel\/(UC[\w-]+)/)
  if (channelMatch) return `@channel-${channelMatch[1].slice(0, 8)}`

  // Handle @username format
  const mentionMatch = input.match(/^@?([\w.-]+)$/)
  if (mentionMatch) return `@${mentionMatch[1]}`

  return null
}
