import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, Maximize2, Grid3X3, MousePointer2 } from 'lucide-react'
import type { CommentData, CanvasSettings } from '../types'
import { ZOOM_LEVELS } from '../types'
import { YouTubeComment } from './YouTubeComment'
import { ExportDialog } from './ExportDialog'

interface CanvasAreaProps {
  comment: CommentData
  canvas: CanvasSettings
  onUpdateCanvas: (field: keyof CanvasSettings, value: unknown) => void
}

export function CanvasArea({ comment, canvas, onUpdateCanvas }: CanvasAreaProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [spaceHeld, setSpaceHeld] = useState(false)
  const [currentZoomIndex, setCurrentZoomIndex] = useState(3) // 100% default
  const [showExport, setShowExport] = useState(false)
  const commentRef = useRef<HTMLDivElement>(null)

  // Listen for export event from toolbar
  useEffect(() => {
    const handleExport = () => setShowExport(true)
    window.addEventListener('ycs-export', handleExport)
    return () => window.removeEventListener('ycs-export', handleExport)
  }, [])

  // Space key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        const tag = (document.activeElement?.tagName || '').toLowerCase()
        if (tag !== 'input' && tag !== 'textarea') {
          setSpaceHeld(true)
        }
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpaceHeld(false)
        setIsPanning(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (spaceHeld || e.button === 1) {
      e.preventDefault()
      setIsPanning(true)
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
    }
  }, [spaceHeld, panOffset])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
    }
  }, [isPanning, panStart])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -1 : 1
      setCurrentZoomIndex(prev => {
        const next = prev + delta
        return Math.max(0, Math.min(ZOOM_LEVELS.length - 1, next))
      })
    }
  }, [])

  const zoomIn = () => {
    setCurrentZoomIndex(prev => Math.min(ZOOM_LEVELS.length - 1, prev + 1))
  }

  const zoomOut = () => {
    setCurrentZoomIndex(prev => Math.max(0, prev - 1))
  }

  const centerCanvas = () => {
    setPanOffset({ x: 0, y: 0 })
    setCurrentZoomIndex(3) // 100%
  }

  const toggleGrid = () => {
    onUpdateCanvas('showGrid', !canvas.showGrid)
  }

  const handleExport = () => {
    setShowExport(true)
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-[#e8e8e8] dark:bg-[#1a1a1a]"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Grid Background */}
      <div
        className="absolute inset-0 transition-opacity"
        style={{
          opacity: canvas.showGrid ? 0.3 : 0,
          backgroundImage: `
            linear-gradient(${canvas.gridColor} 1px, transparent 1px),
            linear-gradient(90deg, ${canvas.gridColor} 1px, transparent 1px)
          `,
          backgroundSize: `${canvas.gridSize}px ${canvas.gridSize}px`,
        }}
      />

      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: canvas.backgroundType === 'gradient'
            ? `linear-gradient(${canvas.gradientAngle || 45}deg, ${canvas.gradientStart || '#667eea'}, ${canvas.gradientEnd || '#764ba2'})`
            : canvas.backgroundColor,
          filter: canvas.blur > 0 ? `blur(${canvas.blur}px)` : 'none',
        }}
      />

      {/* Comment Container */}
      <div
        ref={canvasRef}
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
          cursor: isPanning ? 'grabbing' : spaceHeld ? 'grab' : 'default',
        }}
      >
        <div ref={commentRef} className="inline-block">
          <YouTubeComment comment={comment} canvas={canvas} />
        </div>
      </div>

      {/* Zoom Controls */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/90 dark:bg-[#282828]/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-[#444] px-2 py-1.5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          onClick={zoomOut}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#333] rounded-lg transition-colors text-gray-600 dark:text-[#aaa]"
          whileTap={{ scale: 0.9 }}
          disabled={currentZoomIndex === 0}
        >
          <Minus size={16} />
        </motion.button>

        <div className="flex items-center gap-1 px-2">
          {ZOOM_LEVELS.map((level, i) => (
            <motion.button
              key={level}
              onClick={() => setCurrentZoomIndex(i)}
              className={`px-1.5 py-1 text-xs rounded-md font-medium transition-all ${
                i === currentZoomIndex
                  ? 'bg-[#ff4444] text-white dark:bg-[#ff4444] dark:text-white'
                  : 'text-gray-500 dark:text-[#888] hover:bg-gray-100 dark:hover:bg-[#333]'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              {level}%
            </motion.button>
          ))}
        </div>

        <motion.button
          onClick={zoomIn}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#333] rounded-lg transition-colors text-gray-600 dark:text-[#aaa]"
          whileTap={{ scale: 0.9 }}
          disabled={currentZoomIndex === ZOOM_LEVELS.length - 1}
        >
          <Plus size={16} />
        </motion.button>

        <div className="w-px h-6 bg-gray-200 dark:bg-[#444] mx-1" />

        <motion.button
          onClick={toggleGrid}
          className={`p-1.5 rounded-lg transition-colors ${
            canvas.showGrid
              ? 'bg-red-50 text-[#ff4444] dark:text-[#ff4444]'
              : 'hover:bg-gray-100 dark:hover:bg-[#333] text-gray-600 dark:text-[#aaa] hover:text-[#ff4444]'
          }`}
          whileTap={{ scale: 0.9 }}
          title="Toggle Grid"
        >
          <Grid3X3 size={16} />
        </motion.button>

        <motion.button
          onClick={centerCanvas}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#333] rounded-lg transition-colors text-gray-600 dark:text-[#aaa]"
          whileTap={{ scale: 0.9 }}
          title="Center Canvas"
        >
          <Maximize2 size={16} />
        </motion.button>
      </motion.div>

      {/* Cursor indicator for pan mode */}
      <AnimatePresence>
        {spaceHeld && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
          >
            <MousePointer2 size={12} />
            Arraste para navegar
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Dialog */}
      <AnimatePresence>
        {showExport && (
          <ExportDialog
            commentRef={commentRef}
            onClose={() => setShowExport(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
