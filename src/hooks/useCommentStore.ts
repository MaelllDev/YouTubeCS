import { useState, useCallback, useRef, useEffect } from 'react'
import type { CommentData, CanvasSettings, HistoryEntry } from '../types'
import { DEFAULT_COMMENT_DATA, DEFAULT_CANVAS_SETTINGS } from '../types'

const MAX_HISTORY = 50

export function useCommentStore() {
  const [commentData, setCommentData] = useState<CommentData>(() => {
    const saved = localStorage.getItem('ycs-comment')
    return saved ? { ...DEFAULT_COMMENT_DATA, ...JSON.parse(saved) } : DEFAULT_COMMENT_DATA
  })

  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>(() => {
    const saved = localStorage.getItem('ycs-canvas')
    return saved ? { ...DEFAULT_CANVAS_SETTINGS, ...JSON.parse(saved) } : DEFAULT_CANVAS_SETTINGS
  })

  const [historyIndex, setHistoryIndex] = useState(-1)
  const historyRef = useRef<HistoryEntry[]>([])
  const isUndoRedoRef = useRef(false)

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('ycs-comment', JSON.stringify(commentData))
  }, [commentData])

  useEffect(() => {
    localStorage.setItem('ycs-canvas', JSON.stringify(canvasSettings))
  }, [canvasSettings])

  // Add to history when data changes
  const pushHistory = useCallback((comment: CommentData, canvas: CanvasSettings) => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false
      return
    }
    const entry: HistoryEntry = { commentData: comment, canvasSettings: canvas }
    historyRef.current = historyRef.current.slice(0, historyIndex + 1)
    historyRef.current.push(entry)
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift()
    }
    setHistoryIndex(historyRef.current.length - 1)
  }, [historyIndex])

  const updateComment = useCallback((field: keyof CommentData, value: unknown) => {
    setCommentData(prev => {
      const next = { ...prev, [field]: value }
      pushHistory(next, canvasSettings)
      return next
    })
  }, [canvasSettings, pushHistory])

  const updateCanvas = useCallback((field: keyof CanvasSettings, value: unknown) => {
    setCanvasSettings(prev => {
      const next = { ...prev, [field]: value }
      pushHistory(commentData, next)
      return next
    })
  }, [commentData, pushHistory])

  const updateCommentText = useCallback((text: string) => {
    setCommentData(prev => {
      const next = { ...prev, text }
      pushHistory(next, canvasSettings)
      return next
    })
  }, [canvasSettings, pushHistory])

  const updateLikes = useCallback((likes: number) => {
    setCommentData(prev => {
      const next = { ...prev, likes }
      pushHistory(next, canvasSettings)
      return next
    })
  }, [canvasSettings, pushHistory])

  const setAvatar = useCallback((url: string) => {
    setCommentData(prev => {
      const next = { ...prev, authorAvatar: url }
      pushHistory(next, canvasSettings)
      return next
    })
  }, [canvasSettings, pushHistory])

  const loadTemplate = useCallback((data: Partial<CommentData>, canvas?: Partial<CanvasSettings>) => {
    const newComment = { ...DEFAULT_COMMENT_DATA, ...commentData, ...data }
    const newCanvas = canvas ? { ...DEFAULT_CANVAS_SETTINGS, ...canvasSettings, ...canvas } : canvasSettings
    setCommentData(newComment)
    setCanvasSettings(newCanvas)
    pushHistory(newComment, newCanvas)
  }, [commentData, canvasSettings, pushHistory])

  const resetAll = useCallback(() => {
    setCommentData(DEFAULT_COMMENT_DATA)
    setCanvasSettings(DEFAULT_CANVAS_SETTINGS)
    historyRef.current = []
    setHistoryIndex(-1)
  }, [])

  const undo = useCallback(() => {
    if (historyIndex < 0) return
    const newIndex = historyIndex - 1
    if (newIndex >= 0) {
      const entry = historyRef.current[newIndex]
      isUndoRedoRef.current = true
      setCommentData(entry.commentData)
      setCanvasSettings(entry.canvasSettings)
      setHistoryIndex(newIndex)
    } else {
      isUndoRedoRef.current = true
      setCommentData(DEFAULT_COMMENT_DATA)
      setCanvasSettings(DEFAULT_CANVAS_SETTINGS)
      setHistoryIndex(-1)
    }
  }, [historyIndex])

  const redo = useCallback(() => {
    if (historyIndex >= historyRef.current.length - 1) return
    const newIndex = historyIndex + 1
    const entry = historyRef.current[newIndex]
    isUndoRedoRef.current = true
    setCommentData(entry.commentData)
    setCanvasSettings(entry.canvasSettings)
    setHistoryIndex(newIndex)
  }, [historyIndex])

  const duplicateComment = useCallback(() => {
    return { ...commentData, id: `comment-${Date.now()}` }
  }, [commentData])

  return {
    commentData,
    canvasSettings,
    canUndo: historyIndex >= 0,
    canRedo: historyIndex < historyRef.current.length - 1,
    updateComment,
    updateCanvas,
    updateCommentText,
    updateLikes,
    setAvatar,
    loadTemplate,
    resetAll,
    undo,
    redo,
    duplicateComment,
    setCommentData,
    setCanvasSettings,
  }
}
