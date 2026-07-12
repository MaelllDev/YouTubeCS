export interface ChannelInfo {
  id: string
  name: string
  handle: string
  avatarUrl: string
  verified: boolean
}

export interface CommentData {
  id: string
  authorName: string
  authorHandle: string
  authorAvatar: string
  verified: boolean
  isMember: boolean
  memberBadge?: string
  text: string
  likes: number
  dislikes: number
  time: string
  isPinned: boolean
  heartedByCreator: boolean
  replyCount: number
  showReplyButton: boolean
  showLikeButton: boolean
  showDislikeButton: boolean
  showTranslateButton: boolean
  showViewRepliesButton: boolean
  creatorName?: string
}

export interface CanvasSettings {
  backgroundColor: string
  backgroundType: 'transparent' | 'solid' | 'gradient' | 'image'
  gradientStart?: string
  gradientEnd?: string
  gradientAngle?: number
  backgroundImage?: string
  blur: number
  showGrid: boolean
  gridSize: number
  gridColor: string
  cardBackgroundColor: string
  cardBorderColor: string
  cardBorderWidth: number
  cardBorderRadius: number
  cardShadow: string
  cardPadding: number
  scale: number
  width: number
}

export type ThemeMode = 'light' | 'dark' | 'auto'

export type ZoomLevel = 25 | 50 | 75 | 100 | 125 | 150 | 200

export type ExportFormat = 'png' | 'jpg' | 'webp'
export type ExportScale = 1 | 2 | 4 | 8

export interface ExportSettings {
  format: ExportFormat
  scale: ExportScale
  transparent: boolean
}

export interface Template {
  id: string
  name: string
  description: string
  icon: string
  data: Partial<CommentData>
  canvas: Partial<CanvasSettings>
}

export interface HistoryEntry {
  commentData: CommentData
  canvasSettings: CanvasSettings
}

export type CommentEditorAction =
  | { type: 'SET_FIELD'; field: keyof CommentData; value: unknown }
  | { type: 'UPDATE_TEXT'; text: string }
  | { type: 'UPDATE_LIKES'; likes: number }
  | { type: 'UPDATE_TIME'; time: string }
  | { type: 'SET_AVATAR'; url: string }
  | { type: 'TOGGLE_VERIFIED' }
  | { type: 'TOGGLE_MEMBER' }
  | { type: 'TOGGLE_PINNED' }
  | { type: 'TOGGLE_HEART' }
  | { type: 'SET_REPLY_COUNT'; count: number }
  | { type: 'RESET' }
  | { type: 'LOAD_TEMPLATE'; data: CommentData }
  | { type: 'LOAD_CANVAS'; settings: CanvasSettings }
  | { type: 'SET_CANVAS_FIELD'; field: keyof CanvasSettings; value: unknown }

export const DEFAULT_CANVAS_SETTINGS: CanvasSettings = {
  backgroundColor: '#ffffff',
  backgroundType: 'solid',
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
  gradientAngle: 45,
  blur: 0,
  showGrid: false,
  gridSize: 20,
  gridColor: 'rgba(0,0,0,0.05)',
  cardBackgroundColor: '#ffffff',
  cardBorderColor: '#e0e0e0',
  cardBorderWidth: 1,
  cardBorderRadius: 12,
  cardShadow: '0 2px 8px rgba(0,0,0,0.08)',
  cardPadding: 16,
  scale: 1,
  width: 720,
}

export const DEFAULT_COMMENT_DATA: CommentData = {
  id: 'comment-1',
  authorName: 'Usuário',
  authorHandle: '@usuario',
  authorAvatar: '',
  verified: false,
  isMember: false,
  text: 'Digite seu comentário aqui...',
  likes: 0,
  dislikes: 0,
  time: 'há 1 minuto',
  isPinned: false,
  heartedByCreator: false,
  replyCount: 0,
  showReplyButton: true,
  showLikeButton: true,
  showDislikeButton: true,
  showTranslateButton: true,
  showViewRepliesButton: true,
}

export const TIME_OPTIONS = [
  'Agora',
  'há 5 minutos',
  'há 20 minutos',
  'há 1 hora',
  'há 2 horas',
  'há 1 dia',
  'há 2 dias',
  'há 1 semana',
  'há 2 semanas',
  'há 1 mês',
] as const

export const REPLY_COUNT_OPTIONS = [0, 1, 5, 20, 150] as const

export const ZOOM_LEVELS: ZoomLevel[] = [25, 50, 75, 100, 125, 150, 200]

export const TEMPLATES: Template[] = [
  {
    id: 'simple',
    name: 'Comentário Simples',
    description: 'Comentário básico sem destaques',
    icon: 'MessageSquare',
    data: { isPinned: false, heartedByCreator: false, isMember: false, replyCount: 0 },
    canvas: {},
  },
  {
    id: 'viral',
    name: 'Comentário Viral',
    description: 'Comentário com muitos likes',
    icon: 'Flame',
    data: { likes: 250000, isPinned: false, heartedByCreator: false, isMember: false, replyCount: 150 },
    canvas: {},
  },
  {
    id: 'replied',
    name: 'Comentário Respondido',
    description: 'Comentário com respostas',
    icon: 'Reply',
    data: { replyCount: 20, heartedByCreator: false, isPinned: false },
    canvas: {},
  },
  {
    id: 'pinned',
    name: 'Comentário Fixado',
    description: 'Fixado pelo criador',
    icon: 'Pin',
    data: { isPinned: true, heartedByCreator: false },
    canvas: {},
  },
  {
    id: 'creator',
    name: 'Comentário do Criador',
    description: 'Badge de criador',
    icon: 'Crown',
    data: { verified: true, heartedByCreator: false, authorName: 'Criador', authorHandle: '@criador' },
    canvas: {},
  },
  {
    id: 'hearted',
    name: 'Comentário com Coração',
    description: 'Criador deu coração',
    icon: 'Heart',
    data: { heartedByCreator: true },
    canvas: {},
  },
  {
    id: 'member',
    name: 'Comentário de Membro',
    description: 'Membro do canal',
    icon: 'UserCheck',
    data: { isMember: true, memberBadge: 'Membro' },
    canvas: {},
  },
  {
    id: 'long',
    name: 'Comentário Longo',
    description: 'Texto extenso com várias linhas',
    icon: 'FileText',
    data: {
      text: 'Este é um comentário bastante extenso que demonstra como o texto longo se comporta no layout do YouTube. Perceba como ele se adapta e continua até o final, ocupando várias linhas e mantendo a legibilidade. Perfeito para thumbnails e apresentações.',
      isPinned: false,
      heartedByCreator: false,
    },
    canvas: {},
  },
  {
    id: 'short',
    name: 'Comentário Curto',
    description: 'Resposta rápida e objetiva',
    icon: 'Text',
    data: { text: 'Incrível! 🔥', isPinned: false, heartedByCreator: false },
    canvas: {},
  },
]
