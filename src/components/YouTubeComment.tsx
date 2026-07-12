import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Heart, ThumbsUp, ThumbsDown, MessageCircle, Languages, Pin, Award } from 'lucide-react'
import type { CommentData, CanvasSettings } from '../types'
import { formatLikes, formatReplyCount, parseCommentText } from '../utils'

interface YouTubeCommentProps {
  comment: CommentData
  canvas: CanvasSettings
}

function Avatar({ src, name }: { src: string; name: string }) {
  return (
    <div className="w-[40px] h-[40px] rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-[#333]">
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-[#666] text-sm font-medium">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  )
}

function CommentText({ text }: { text: string }) {
  const parts = useMemo(() => parseCommentText(text), [text])

  return (
    <span>
      {parts.map((part, i) => {
        switch (part.type) {
          case 'mention':
            return (
              <span key={i} className="text-[#065fd4] dark:text-[#3ea6ff] cursor-pointer hover:underline">
                {part.value}
              </span>
            )
          case 'hashtag':
            return (
              <span key={i} className="text-[#065fd4] dark:text-[#3ea6ff] cursor-pointer hover:underline">
                {part.value}
              </span>
            )
          case 'link':
            return (
              <span key={i} className="text-[#065fd4] dark:text-[#3ea6ff] cursor-pointer hover:underline break-all">
                {part.value}
              </span>
            )
          default:
            return <span key={i}>{part.value}</span>
        }
      })}
    </span>
  )
}

export function YouTubeComment({ comment, canvas }: YouTubeCommentProps) {
  const isDark = canvas.cardBackgroundColor === '#0f0f0f' || canvas.cardBackgroundColor === '#1a1a1a' || canvas.cardBackgroundColor === '#212121'

  return (
    <motion.div
      layout
      className="font-[Roboto]"
      style={{
        backgroundColor: canvas.cardBackgroundColor,
        borderColor: canvas.cardBorderColor,
        borderWidth: canvas.cardBorderWidth,
        borderRadius: canvas.cardBorderRadius,
        boxShadow: canvas.cardShadow,
        padding: canvas.cardPadding,
        transform: `scale(${canvas.scale})`,
        transformOrigin: 'top left',
        width: canvas.width,
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* Comment Card */}
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar src={comment.authorAvatar} name={comment.authorName} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1 flex-wrap">
            <span
              className="text-[13px] font-medium leading-[1.4]"
              style={{ color: isDark ? '#f1f1f1' : '#0f0f0f' }}
            >
              {comment.authorName || 'Usuário'}
            </span>

            {/* Verified Badge */}
            {comment.verified && (
              <svg
                viewBox="0 0 24 24"
                className="w-[14px] h-[14px]"
                fill="#606060"
                style={isDark ? { fill: '#888' } : {}}
              >
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            )}

            {/* Member Badge */}
            {comment.isMember && (
              <span className="flex items-center gap-0.5 text-[11px] text-[#606060] dark:text-[#aaa] bg-gray-100 dark:bg-[#333] px-1.5 py-0.5 rounded-[3px]">
                <Award size={10} />
                Membro
              </span>
            )}

            {/* Time */}
            <span className="text-[12px] text-[#606060] dark:text-[#aaa]">
              {comment.time || 'há 1 minuto'}
            </span>
          </div>

          {/* Pinned Badge */}
          {comment.isPinned && (
            <div className="flex items-center gap-1 mt-0.5 mb-1">
              <Pin size={12} className="text-[#606060] dark:text-[#aaa]" />
              <span className="text-[11px] text-[#606060] dark:text-[#aaa] font-medium">
                Fixado pelo criador
              </span>
            </div>
          )}

          {/* Comment Text */}
          <div
            className="text-[14px] leading-[1.5] mt-0.5 whitespace-pre-wrap break-words"
            style={{ color: isDark ? '#f1f1f1' : '#0f0f0f' }}
          >
            <CommentText text={comment.text} />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 mt-1">
            {/* Like Button */}
            {comment.showLikeButton && (
              <div className="flex items-center">
                <div className="flex items-center gap-0.5 px-2 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#333] cursor-pointer transition-colors">
                  <ThumbsUp size={16} className="text-[#606060] dark:text-[#aaa]" />
                  {comment.likes > 0 && (
                    <span className="text-[12px] text-[#606060] dark:text-[#aaa] font-medium ml-1">
                      {formatLikes(comment.likes)}
                    </span>
                  )}
                </div>
                {/* Dislike Button */}
                {comment.showDislikeButton && (
                  <>
                    <div className="w-px h-6 bg-gray-300 dark:bg-[#555] mx-1" />
                    <div className="flex items-center px-2 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#333] cursor-pointer transition-colors">
                      <ThumbsDown size={16} className="text-[#606060] dark:text-[#aaa]" />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Reply Button */}
            {comment.showReplyButton && (
              <div className="flex items-center px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#333] cursor-pointer transition-colors">
                <MessageCircle size={16} className="text-[#606060] dark:text-[#aaa]" />
                <span className="text-[12px] text-[#606060] dark:text-[#aaa] font-medium ml-1.5">
                  Responder
                </span>
              </div>
            )}

            {/* Translate Button */}
            {comment.showTranslateButton && (
              <div className="flex items-center px-2 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#333] cursor-pointer transition-colors">
                <Languages size={16} className="text-[#606060] dark:text-[#aaa]" />
              </div>
            )}

            {/* Heart from Creator */}
            {comment.heartedByCreator && (
              <div className="flex items-center ml-auto">
                <Heart
                  size={16}
                  className="text-[#606060] dark:text-[#aaa]"
                  fill="#ff0000"
                  stroke="#ff0000"
                />
              </div>
            )}
          </div>

          {/* View Replies */}
          {comment.showViewRepliesButton && comment.replyCount > 0 && (
            <div className="flex items-center gap-1.5 mt-1.5 cursor-pointer group">
              <div className="w-[2px] h-4 bg-[#065fd4] dark:bg-[#3ea6ff] rounded-full" />
              <span className="text-[14px] text-[#065fd4] dark:text-[#3ea6ff] font-medium group-hover:underline">
                {formatReplyCount(comment.replyCount) || `Ver ${comment.replyCount} respostas`}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
