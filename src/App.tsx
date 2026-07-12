import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  ChevronRight,
  ChevronLeft,
  Layout,
  RotateCcw,
  Download,
  Copy,
  CopyPlus,
  Undo2,
  Redo2,
  Sparkles,
  Gamepad2,
  Code2,
} from 'lucide-react'
import { CommentEditor } from './components/CommentEditor'
import { CanvasArea } from './components/CanvasArea'
import { SidebarRight } from './components/SidebarRight'
import { TemplateSelector } from './components/TemplateSelector'
import { useCommentStore } from './hooks/useCommentStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import type { Template, ThemeMode } from './types'

function App() {
  const {
    commentData,
    canvasSettings,
    canUndo,
    canRedo,
    updateComment,
    updateCanvas,
    updateCommentText,
    updateLikes,
    setAvatar,
    resetAll,
    undo,
    redo,
    loadTemplate,
  } = useCommentStore()

  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const [showTemplates, setShowTemplates] = useState(false)
  const [theme, setTheme] = useState<ThemeMode>('light')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
  const [leftAnimating, setLeftAnimating] = useState(false)
  const [rightAnimating, setRightAnimating] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setLeftOpen(false)
        setRightOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Panel animation variants
  const panelVariants: Variants = {
    hiddenLeft: {
      width: 0,
      opacity: 0,
      x: -20,
      transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
    },
    visibleLeft: {
      width: isMobile ? '100%' : 320,
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        damping: 22,
        stiffness: 260,
        mass: 0.8,
        opacity: { duration: 0.15 }
      }
    },
    hiddenRight: {
      width: 0,
      opacity: 0,
      x: 20,
      transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
    },
    visibleRight: {
      width: isMobile ? '100%' : 280,
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        damping: 22,
        stiffness: 260,
        mass: 0.8,
        opacity: { duration: 0.15 }
      }
    },
  }

  // Content fade-in animation
  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.08, duration: 0.2 }
    }
  }

  // Backdrop overlay variant
  const backdropVariants: Variants = {
    hidden: { opacity: 0, transition: { duration: 0.15 } },
    visible: { opacity: 1, transition: { duration: 0.2 } }
  }

  const showToast = useCallback((message: string, type: 'success' | 'info' = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }, [])

  const handleCopyConfig = useCallback(() => {
    const config = {
      comment: commentData,
      canvas: canvasSettings,
    }
    navigator.clipboard.writeText(JSON.stringify(config, null, 2))
      .then(() => showToast('Configuração copiada!', 'success'))
      .catch(() => showToast('Erro ao copiar', 'info'))
  }, [commentData, canvasSettings, showToast])

  const handleSave = useCallback(() => {
    showToast('Projeto salvo! 💾', 'success')
  }, [showToast])

  const handleDelete = useCallback(() => {
    resetAll()
    showToast('Redefinido!', 'info')
  }, [resetAll, showToast])

  const handleDuplicate = useCallback(() => {
    const dup = { ...commentData, id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }
    Object.entries(dup).forEach(([key, value]) => {
      updateComment(key as keyof typeof commentData, value)
    })
    showToast('Comentário duplicado!', 'success')
  }, [commentData, updateComment, showToast])

  const handleSelectTemplate = useCallback((template: Template) => {
    loadTemplate(template.data, template.canvas)
    showToast(`Template "${template.name}" aplicado!`, 'success')
  }, [loadTemplate, showToast])

  const handleThemeChange = useCallback((newTheme: ThemeMode) => {
    setTheme(newTheme)

    if (newTheme === 'light') {
      updateCanvas('cardBackgroundColor', '#ffffff')
      updateCanvas('backgroundColor', '#ffffff')
    } else if (newTheme === 'dark') {
      updateCanvas('cardBackgroundColor', '#212121')
      updateCanvas('backgroundColor', '#0f0f0f')
    }
  }, [updateCanvas])

  const keyboardHandlers = useMemo(() => ({
    undo,
    redo,
    reset: resetAll,
    copyConfig: handleCopyConfig,
    save: handleSave,
    delete: handleDelete,
  }), [undo, redo, resetAll, handleCopyConfig, handleSave, handleDelete])

  useKeyboardShortcuts(keyboardHandlers)

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Top Bar */}
      <motion.header
        className="h-12 bg-white dark:bg-[#0f0f0f] border-b border-gray-200 dark:border-[#333] flex items-center justify-between px-2 sm:px-3 flex-shrink-0 z-20"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="flex items-center gap-1 sm:gap-2">
          <motion.button
            onClick={() => {
              setLeftOpen(!leftOpen)
              if (isMobile && !leftOpen) setRightOpen(false)
            }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#272727] rounded-lg transition-colors text-gray-500 dark:text-[#888]"
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.05 }}
            animate={{ rotate: leftOpen ? 0 : -180 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            title={leftOpen ? 'Fechar editor' : 'Abrir editor'}
          >
            <ChevronLeft size={18} />
          </motion.button>

          <div className="flex items-center gap-2 ml-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#ff4444] to-[#cc0000] flex items-center justify-center shadow-sm">
              <Gamepad2 size={16} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-800 dark:text-[#f1f1f1] hidden sm:block">
              YouTube Comment Studio
            </span>
          </div>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <span className="hidden md:flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-[#666] mr-1 bg-gray-50 dark:bg-[#1a1a1a] px-2 py-1 rounded-md border border-gray-200 dark:border-[#333]">
            <Sparkles size={10} className="text-[#ff4444]" />
            by MaellDev
          </span>
          <ToolbarButton icon={Layout} label="Templates" onClick={() => setShowTemplates(true)} />
          <ToolbarButton icon={Undo2} label="Desfazer" onClick={undo} disabled={!canUndo} />
          <ToolbarButton icon={Redo2} label="Refazer" onClick={redo} disabled={!canRedo} />
          <ToolbarButton icon={Copy} label="Copiar Config" onClick={handleCopyConfig} />
          <ToolbarButton icon={CopyPlus} label="Duplicar" onClick={handleDuplicate} />
          <ToolbarButton icon={Download} label="Exportar" onClick={() => {
            window.dispatchEvent(new CustomEvent('ycs-export'))
          }} />
          <ToolbarButton icon={RotateCcw} label="Resetar" onClick={resetAll} />
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => {
              setRightOpen(!rightOpen)
              if (isMobile && !rightOpen) setLeftOpen(false)
            }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#272727] rounded-lg transition-colors text-gray-500 dark:text-[#888]"
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.05 }}
            animate={{ rotate: rightOpen ? 0 : 180 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            title={rightOpen ? 'Fechar configurações' : 'Abrir configurações'}
          >
            <ChevronRight size={18} />
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar Backdrop (mobile) */}
        <AnimatePresence>
          {leftOpen && isMobile && (
            <motion.div
              key="left-backdrop"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute inset-0 z-20 bg-black/40 backdrop-blur-sm"
              onClick={() => setLeftOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Left Sidebar */}
        <AnimatePresence initial={false}>
          {leftOpen && (
            <motion.aside
              key="left-sidebar"
              variants={panelVariants}
              initial="hiddenLeft"
              animate="visibleLeft"
              exit="hiddenLeft"
              onAnimationStart={() => setLeftAnimating(true)}
              onAnimationComplete={() => setLeftAnimating(false)}
              className={`bg-white dark:bg-[#121212] border-r border-gray-200 dark:border-[#333] flex flex-col h-full flex-shrink-0 ${
                isMobile ? 'absolute inset-y-0 left-0 z-30' : 'relative'
              }`}
            >
              {/* Editor Header */}
              <div className="h-9 border-b border-gray-200 dark:border-[#333] flex items-center px-4 flex-shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-[#666] flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${leftAnimating ? 'bg-[#ff4444]' : 'bg-green-500'}`} />
                  Editor
                </span>
              </div>
              <motion.div
                className={`flex-1 overflow-y-auto min-h-0 ${isMobile ? 'w-full' : 'w-[320px]'}`}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="min-h-0">
                  <CommentEditor
                    data={commentData}
                    onUpdate={updateComment}
                    onUpdateText={updateCommentText}
                    onUpdateLikes={updateLikes}
                    onSetAvatar={setAvatar}
                  />
                </div>
              </motion.div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Canvas */}
        <CanvasArea
          comment={commentData}
          canvas={canvasSettings}
          onUpdateCanvas={updateCanvas}
        />

        {/* Right Sidebar Backdrop (mobile) */}
        <AnimatePresence>
          {rightOpen && isMobile && (
            <motion.div
              key="right-backdrop"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="absolute inset-0 z-20 bg-black/40 backdrop-blur-sm"
              onClick={() => setRightOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Right Sidebar */}
        <AnimatePresence initial={false}>
          {rightOpen && (
            <motion.aside
              key="right-sidebar"
              variants={panelVariants}
              initial="hiddenRight"
              animate="visibleRight"
              exit="hiddenRight"
              onAnimationStart={() => setRightAnimating(true)}
              onAnimationComplete={() => setRightAnimating(false)}
              className={`bg-white dark:bg-[#121212] border-l border-gray-200 dark:border-[#333] flex flex-col h-full flex-shrink-0 ${
                isMobile ? 'absolute inset-y-0 right-0 z-30' : 'relative'
              }`}
            >
              {/* Settings Header */}
              <div className="h-9 border-b border-gray-200 dark:border-[#333] flex items-center px-4 flex-shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-[#666] flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${rightAnimating ? 'bg-[#ff4444]' : 'bg-green-500'}`} />
                  Configurações
                </span>
              </div>
              <motion.div
                className={`flex-1 overflow-y-auto min-h-0 ${isMobile ? 'w-full' : 'w-[280px]'}`}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="min-h-0">
                  <SidebarRight
                    canvas={canvasSettings}
                    theme={theme}
                    onUpdateCanvas={updateCanvas}
                    onThemeChange={handleThemeChange}
                  />
                </div>
              </motion.div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Template Selector */}
      <TemplateSelector
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={handleSelectTemplate}
      />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-[#1a1a1a] text-white dark:text-[#f1f1f1] text-sm font-medium shadow-2xl border border-gray-700 dark:border-[#333] flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Sparkles size={14} className="text-[#ff4444]" />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Credits */}
      <motion.div
        className="fixed bottom-3 right-3 z-40 flex items-center gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <span className="text-[10px] text-gray-400 dark:text-[#666] bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-[#333] flex items-center gap-1.5">
          <Code2 size={10} className="text-[#ff4444]" />
          Feito com ❤️ por{' '}
          <a
            href="https://github.com/MaelllDev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#ff4444] hover:text-[#cc0000] font-medium transition-colors"
          >
            MaellDev
          </a>
        </span>
      </motion.div>

      {/* Keyboard Shortcuts Hint */}
      <motion.div
        className="fixed bottom-3 left-3 z-40 hidden lg:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="text-[10px] text-gray-400 dark:text-[#666] bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-[#333]">
          Ctrl+Z Desfazer · Ctrl+Shift+Z Refazer · Espaço + Arraste · Ctrl+Roda zoom
        </div>
      </motion.div>
    </div>
  )
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  active,
}: {
  icon: React.ElementType
  label: string
  onClick: () => void
  disabled?: boolean
  active?: boolean
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded-lg transition-colors text-xs ${
        active
          ? 'bg-red-50 dark:bg-red-900/20 text-[#ff4444] dark:text-[#ff4444]'
          : 'text-gray-500 dark:text-[#888] hover:bg-gray-100 dark:hover:bg-[#272727] hover:text-[#ff4444] dark:hover:text-[#ff4444]'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
      whileTap={disabled ? {} : { scale: 0.9 }}
      title={label}
    >
      <Icon size={18} />
    </motion.button>
  )
}

export default App
