import { useEffect } from 'react'

interface ShortcutHandlers {
  undo: () => void
  redo: () => void
  reset: () => void
  copyConfig: () => void
  save: () => void
  delete: () => void
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey

      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handlers.undo()
        return
      }

      if (ctrl && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        handlers.redo()
        return
      }

      if (ctrl && e.key === 'Z') {
        e.preventDefault()
        handlers.redo()
        return
      }

      if (ctrl && e.key === 's') {
        e.preventDefault()
        handlers.save()
        return
      }

      if (ctrl && e.key === 'c') {
        // Only intercept if focus is not on an input
        const tag = (document.activeElement?.tagName || '').toLowerCase()
        if (tag !== 'input' && tag !== 'textarea') {
          handlers.copyConfig()
        }
        return
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const tag = (document.activeElement?.tagName || '').toLowerCase()
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault()
          handlers.delete()
        }
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers])
}
