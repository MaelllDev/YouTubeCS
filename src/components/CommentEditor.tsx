import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  AtSign,
  MessageSquare,
  ThumbsUp,
  Clock,
  Image,
  CheckCircle,
  Heart,
  Pin,
  Award,
  MessageCircle,
  Eye,
  EyeOff,
  ThumbsDown,
  Languages,
  Search,
  Upload,
  Link,
  Loader2,
  AlertCircle,
  Hash,
  Check,
} from 'lucide-react'
import { searchChannel } from '../services/mockChannelService'
import type { CommentData, ChannelInfo } from '../types'
import { TIME_OPTIONS, REPLY_COUNT_OPTIONS } from '../types'

interface CommentEditorProps {
  data: CommentData
  onUpdate: (field: keyof CommentData, value: unknown) => void
  onUpdateText: (text: string) => void
  onUpdateLikes: (likes: number) => void
  onSetAvatar: (url: string) => void
}

function ToggleSwitch({
  label,
  checked,
  onChange,
  icon: Icon,
  description,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  icon: React.ElementType
  description?: string
}) {
  return (
    <motion.button
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 text-left ${
        checked
          ? 'bg-red-50 dark:bg-red-900/20 text-[#ff4444] dark:text-[#ff4444]'
          : 'hover:bg-gray-100 dark:hover:bg-[#272727] text-gray-700 dark:text-[#aaa]'
      }`}
      whileTap={{ scale: 0.98 }}
    >
      <div className={`p-1.5 rounded-full transition-colors ${
        checked ? 'bg-[#ff4444]/10 dark:bg-[#ff4444]/10' : 'bg-gray-100 dark:bg-[#333]'
      }`}>
        <Icon size={16} className={checked ? 'text-[#ff4444] dark:text-[#ff4444]' : 'text-gray-500 dark:text-[#888]'} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {description && <div className="text-xs text-gray-500 dark:text-[#888] mt-0.5">{description}</div>}
      </div>
      <div className={`w-10 h-6 rounded-full transition-all duration-300 flex items-center px-0.5 ${
        checked ? 'bg-[#ff4444] dark:bg-[#ff4444] justify-end' : 'bg-gray-300 dark:bg-[#555] justify-start'
      }`}>
        <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
      </div>
    </motion.button>
  )
}

function InputField({
  label,
  value,
  onChange,
  icon: Icon,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  icon: React.ElementType
  placeholder?: string
  type?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-500 dark:text-[#888] flex items-center gap-1.5">
        <Icon size={12} />
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-[#eee] placeholder-gray-400 dark:placeholder-[#666] focus:border-[#ff4444] dark:focus:border-[#ff4444] focus:ring-1 focus:ring-[#ff4444]/20 outline-none transition-all outline-none transition-all"
      />
    </div>
  )
}

export function CommentEditor({ data, onUpdate, onUpdateText, onUpdateLikes, onSetAvatar }: CommentEditorProps) {
  const [searchInput, setSearchInput] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [showCustomTime, setShowCustomTime] = useState(false)
  const [customTime, setCustomTime] = useState('')
  const [showAvatarUrlInput, setShowAvatarUrlInput] = useState(false)
  const [avatarUrlInput, setAvatarUrlInput] = useState('')

  const handleSearchChannel = async () => {
    if (!searchInput.trim()) return
    setSearching(true)
    setSearchError(null)

    try {
      const channel = await searchChannel(searchInput)
      if (channel) {
        applyChannel(channel)
      } else {
        setSearchError('Canal não encontrado. Verifique o link ou nome.')
      }
    } catch {
      setSearchError('Erro ao buscar canal.')
    } finally {
      setSearching(false)
    }
  }

  const applyChannel = (channel: ChannelInfo) => {
    onUpdate('authorName', channel.name)
    onUpdate('authorHandle', channel.handle)
    onUpdate('verified', channel.verified)
    if (channel.avatarUrl) {
      onSetAvatar(channel.avatarUrl)
    }
  }

  const handleTimeSelect = (time: string) => {
    if (time === 'Personalizado') {
      setShowCustomTime(true)
    } else {
      onUpdate('time', time)
      setShowCustomTime(false)
    }
  }

  const handleAvatarUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          if (ev.target?.result) {
            onSetAvatar(ev.target.result as string)
          }
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handleAvatarUrlSubmit = () => {
    if (avatarUrlInput.trim()) {
      onSetAvatar(avatarUrlInput.trim())
      setShowAvatarUrlInput(false)
      setAvatarUrlInput('')
    }
  }

  const handleLikeInput = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '')
    const num = parseInt(cleaned, 10) || 0
    onUpdateLikes(num)
  }

  return (
    <div>
      <div className="p-4 space-y-5">
        {/* Section: Channel Search */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-[#666] mb-3 flex items-center gap-1.5">
            <Search size={12} />
            Buscar Canal
          </h3>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchChannel()}
                placeholder="youtube.com/@canal ou @username"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-[#eee] placeholder-gray-400 dark:placeholder-[#666] focus:border-[#ff4444] dark:focus:border-[#ff4444] focus:ring-1 focus:ring-[#ff4444]/20 outline-none transition-all"
              />
              <motion.button
                onClick={handleSearchChannel}
                disabled={searching}
                className="px-3 py-2 bg-[#ff4444] dark:bg-[#ff4444] text-white rounded-lg text-sm font-medium hover:bg-[#cc0000] dark:hover:bg-[#cc0000] transition-colors disabled:opacity-50 flex items-center gap-1"
                whileTap={{ scale: 0.95 }}
              >
                {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              </motion.button>
            </div>
            <AnimatePresence>
              {searchError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg"
                >
                  <AlertCircle size={12} />
                  {searchError}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <hr className="border-gray-200 dark:border-[#333]" />

        {/* Section: Author Info */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-[#666] flex items-center gap-1.5">
            <User size={12} />
            Autor
          </h3>
          <InputField label="Nome" value={data.authorName} onChange={(v) => onUpdate('authorName', v)} icon={User} placeholder="Nome do autor" />
          <InputField label="Handle" value={data.authorHandle} onChange={(v) => onUpdate('authorHandle', v)} icon={AtSign} placeholder="@usuario" />

          {/* Avatar */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-[#888] flex items-center gap-1.5">
              <Image size={12} />
              Avatar
            </label>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-[#333] flex-shrink-0">
                {data.authorAvatar ? (
                  <img src={data.authorAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-[#666]">
                    <User size={16} />
                  </div>
                )}
              </div>
              <div className="flex gap-1.5 flex-1">
                <motion.button
                  onClick={handleAvatarUpload}
                  className="flex-1 px-2.5 py-2 text-xs rounded-lg border border-gray-200 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors flex items-center justify-center gap-1 text-gray-600 dark:text-[#aaa]"
                  whileTap={{ scale: 0.95 }}
                >
                  <Upload size={12} />
                  Upload
                </motion.button>
                <motion.button
                  onClick={() => setShowAvatarUrlInput(!showAvatarUrlInput)}
                  className="flex-1 px-2.5 py-2 text-xs rounded-lg border border-gray-200 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors flex items-center justify-center gap-1 text-gray-600 dark:text-[#aaa]"
                  whileTap={{ scale: 0.95 }}
                >
                  <Link size={12} />
                  URL
                </motion.button>
              </div>
            </div>
            <AnimatePresence>
              {showAvatarUrlInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={avatarUrlInput}
                    onChange={(e) => setAvatarUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAvatarUrlSubmit()}
                    placeholder="https://exemplo.com/avatar.jpg"
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-[#eee] focus:border-[#ff4444] outline-none transition-all"
                  />
                  <motion.button
                    onClick={handleAvatarUrlSubmit}
                    className="px-2.5 py-1.5 bg-[#ff4444] dark:bg-[#ff4444] text-white rounded-lg text-xs font-medium"
                    whileTap={{ scale: 0.95 }}
                  >
                    <Check size={14} />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <hr className="border-gray-200 dark:border-[#333]" />

        {/* Section: Comment Text */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-[#888] flex items-center gap-1.5">
            <MessageSquare size={12} />
            Comentário
          </label>
          <textarea
            value={data.text}
            onChange={(e) => onUpdateText(e.target.value)}
            placeholder="Digite o comentário..."
            rows={4}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-[#eee] placeholder-gray-400 dark:placeholder-[#666] focus:border-[#ff4444] dark:focus:border-[#ff4444] focus:ring-1 focus:ring-[#ff4444]/20 outline-none transition-all resize-none font-[Roboto] leading-relaxed"
            style={{ minHeight: '80px' }}
          />
          <div className="text-xs text-gray-400 dark:text-[#666] flex items-center gap-2">
            <Hash size={10} />
            Menções (@user), hashtags (#tag) e links são destacados automaticamente
          </div>
        </div>

        <hr className="border-gray-200 dark:border-[#333]" />

        {/* Section: Engagement */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-[#666] flex items-center gap-1.5">
            <ThumbsUp size={12} />
            Engajamento
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-[#888] flex items-center gap-1.5">
              <ThumbsUp size={12} />
              Likes
            </label>
            <input
              type="text"
              value={data.likes || ''}
              onChange={(e) => handleLikeInput(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-[#eee] focus:border-[#ff4444] dark:focus:border-[#ff4444] focus:ring-1 focus:ring-[#ff4444]/20 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-[#888] flex items-center gap-1.5">
              <ThumbsDown size={12} />
              Dislikes
            </label>
            <input
              type="text"
              value={data.dislikes || ''}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/[^0-9]/g, '')
                onUpdate('dislikes', parseInt(cleaned, 10) || 0)
              }}
              placeholder="0"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-[#eee] focus:border-[#ff4444] dark:focus:border-[#ff4444] focus:ring-1 focus:ring-[#ff4444]/20 outline-none transition-all"
            />
          </div>

          {/* Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-[#888] flex items-center gap-1.5">
              <Clock size={12} />
              Tempo
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TIME_OPTIONS.slice(0, 6).map((time) => (
                <motion.button
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  className={`px-2.5 py-1.5 text-xs rounded-lg border transition-all ${
                    data.time === time
                      ? 'bg-red-50 dark:bg-red-900/20 border-[#ff4444]/30 dark:border-[#ff4444]/30 text-[#ff4444] dark:text-[#ff4444] font-medium'
                      : 'border-gray-200 dark:border-[#333] text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:hover:bg-[#252525]'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {time}
                </motion.button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TIME_OPTIONS.slice(6).map((time) => (
                <motion.button
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  className={`px-2.5 py-1.5 text-xs rounded-lg border transition-all ${
                    data.time === time
                      ? 'bg-red-50 dark:bg-red-900/20 border-[#ff4444]/30 dark:border-[#ff4444]/30 text-[#ff4444] dark:text-[#ff4444] font-medium'
                      : 'border-gray-200 dark:border-[#333] text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:hover:bg-[#252525]'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {time}
                </motion.button>
              ))}
              <motion.button
                onClick={() => setShowCustomTime(!showCustomTime)}
                className={`px-2.5 py-1.5 text-xs rounded-lg border transition-all ${
                  showCustomTime
                    ? 'bg-red-50 dark:bg-red-900/20 border-[#ff4444]/30 dark:border-[#ff4444]/30 text-[#ff4444] dark:text-[#ff4444] font-medium'
                    : 'border-gray-200 dark:border-[#333] text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:hover:bg-[#252525]'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                Personalizado
              </motion.button>
            </div>
            <AnimatePresence>
              {showCustomTime && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <input
                    type="text"
                    value={customTime}
                    onChange={(e) => {
                      setCustomTime(e.target.value)
                      onUpdate('time', e.target.value)
                    }}
                    placeholder="Ex: há 3 meses"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-[#eee] focus:border-[#ff4444] outline-none transition-all"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reply Count */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-[#888] flex items-center gap-1.5">
              <MessageCircle size={12} />
              Respostas
            </label>
            <div className="flex flex-wrap gap-1.5">
              {REPLY_COUNT_OPTIONS.map((count) => (
                <motion.button
                  key={count}
                  onClick={() => onUpdate('replyCount', count)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                    data.replyCount === count
                      ? 'bg-red-50 dark:bg-red-900/20 border-[#ff4444]/30 dark:border-[#ff4444]/30 text-[#ff4444] dark:text-[#ff4444] font-medium'
                      : 'border-gray-200 dark:border-[#333] text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:hover:bg-[#252525]'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {count === 0 ? '0' : count === 1 ? '1' : count.toString()}
                </motion.button>
              ))}
              <input
                type="number"
                value={data.replyCount}
                onChange={(e) => onUpdate('replyCount', parseInt(e.target.value) || 0)}
                className="w-16 px-2 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-[#eee] focus:border-[#ff4444] outline-none transition-all"
                min={0}
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-200 dark:border-[#333]" />

        {/* Section: Toggles */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-[#666] mb-2 flex items-center gap-1.5">
            Recursos
          </h3>

          <ToggleSwitch
            label="Canal Verificado"
            checked={data.verified}
            onChange={(v) => onUpdate('verified', v)}
            icon={CheckCircle}
            description="Selo azul de verificação"
          />

          <ToggleSwitch
            label="Comentário Fixado"
            checked={data.isPinned}
            onChange={(v) => onUpdate('isPinned', v)}
            icon={Pin}
            description="📌 Fixado pelo criador"
          />

          <ToggleSwitch
            label="Coração do Criador"
            checked={data.heartedByCreator}
            onChange={(v) => onUpdate('heartedByCreator', v)}
            icon={Heart}
            description="Criador curtiu o comentário"
          />

          <ToggleSwitch
            label="Membro do Canal"
            checked={data.isMember}
            onChange={(v) => onUpdate('isMember', v)}
            icon={Award}
            description="Badge de membro"
          />

          <ToggleSwitch
            label="Botão Responder"
            checked={data.showReplyButton}
            onChange={(v) => onUpdate('showReplyButton', v)}
            icon={MessageCircle}
          />

          <ToggleSwitch
            label="Botão Curtir"
            checked={data.showLikeButton}
            onChange={(v) => onUpdate('showLikeButton', v)}
            icon={ThumbsUp}
          />

          <ToggleSwitch
            label="Botão Não Curtir"
            checked={data.showDislikeButton}
            onChange={(v) => onUpdate('showDislikeButton', v)}
            icon={ThumbsDown}
          />

          <ToggleSwitch
            label="Botão Traduzir"
            checked={data.showTranslateButton}
            onChange={(v) => onUpdate('showTranslateButton', v)}
            icon={Languages}
          />

          <ToggleSwitch
            label="Ver Respostas"
            checked={data.showViewRepliesButton}
            onChange={(v) => onUpdate('showViewRepliesButton', v)}
            icon={Eye}
            description="Mostrar ▼ Ver respostas"
          />
        </div>
      </div>
    </div>
  )
}
