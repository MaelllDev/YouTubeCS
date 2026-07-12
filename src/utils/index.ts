export function formatLikes(count: number): string {
  if (count === 0) return '0'
  if (count < 1000) return count.toString()
  if (count < 100000) return `${Math.floor(count / 1000)} mil`
  if (count < 1000000) return `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1).replace('.', ',')} mil`
  return `${(count / 1000000).toFixed(count % 1000000 === 0 ? 0 : 1).replace('.', ',')} mi`
}

export function formatReplyCount(count: number): string {
  if (count === 0) return ''
  if (count === 1) return 'Ver resposta'
  return `Ver ${count} respostas`
}

export function parseCommentText(text: string): Array<{ type: 'text' | 'mention' | 'hashtag' | 'link'; value: string }> {
  const parts: Array<{ type: 'text' | 'mention' | 'hashtag' | 'link'; value: string }> = []
  const regex = /(@\w+)|(#\w+)|(https?:\/\/[^\s<]+)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }
    if (match[1]) {
      parts.push({ type: 'mention', value: match[1] })
    } else if (match[2]) {
      parts.push({ type: 'hashtag', value: match[2] })
    } else if (match[3]) {
      parts.push({ type: 'link', value: match[3] })
    }
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) })
  }

  return parts.length > 0 ? parts : [{ type: 'text', value: text }]
}

export function generateId(): string {
  return `comment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
