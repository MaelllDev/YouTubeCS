import { motion, AnimatePresence } from 'framer-motion'
import { Layout, X, Flame, MessageSquare, Reply, Pin, Crown, Heart, UserCheck, FileText, Text } from 'lucide-react'
import { TEMPLATES } from '../types'
import type { Template } from '../types'

interface TemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (template: Template) => void
}

const iconMap: Record<string, React.ElementType> = {
  MessageSquare,
  Flame,
  Reply,
  Pin,
  Crown,
  Heart,
  UserCheck,
  FileText,
  Text,
}

export function TemplateSelector({ isOpen, onClose, onSelect }: TemplateSelectorProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="bg-white dark:bg-[#212121] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#444] w-[600px] max-w-[95vw] max-h-[85vh] overflow-y-auto"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#333]">
              <h2 className="text-lg font-medium text-gray-900 dark:text-[#f1f1f1] flex items-center gap-2">
                <Layout size={18} />
                Templates
              </h2>
              <motion.button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#333] rounded-lg transition-colors text-gray-500 dark:text-[#888]"
                whileTap={{ scale: 0.9 }}
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* Template Grid */}
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TEMPLATES.map((template) => {
                const Icon = iconMap[template.icon] || MessageSquare
                return (
                  <motion.button
                    key={template.id}
                    onClick={() => {
                      onSelect(template)
                      onClose()
                    }}
                    className="p-4 rounded-xl border-2 border-gray-200 dark:border-[#333] hover:border-[#ff4444] dark:hover:border-[#ff4444] hover:bg-red-50 dark:hover:bg-[#1a1a1a] transition-all text-left group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="p-2.5 rounded-full bg-gray-100 dark:bg-[#333] group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors w-fit mb-3">
                      <Icon size={18} className="text-gray-600 dark:text-[#aaa] group-hover:text-[#ff4444] dark:group-hover:text-[#ff4444] transition-colors" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-800 dark:text-[#ddd] mb-0.5">{template.name}</h3>
                    <p className="text-xs text-gray-400 dark:text-[#888]">{template.description}</p>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
