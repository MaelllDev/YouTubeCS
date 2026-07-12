import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, Download, Image, FileType, ZoomIn, ZoomOut, Check } from 'lucide-react'
import html2canvas from 'html2canvas'
import type { ExportFormat, ExportScale } from '../types'
import { downloadBlob } from '../utils'

interface ExportDialogProps {
  commentRef: React.RefObject<HTMLDivElement | null>
  onClose: () => void
}

const formats: { format: ExportFormat; label: string; icon: React.ElementType; mime: string }[] = [
  { format: 'png', label: 'PNG', icon: Image, mime: 'image/png' },
  { format: 'jpg', label: 'JPG', icon: FileType, mime: 'image/jpeg' },
  { format: 'webp', label: 'WEBP', icon: FileType, mime: 'image/webp' },
]

const scales: ExportScale[] = [1, 2, 4, 8]

export function ExportDialog({ commentRef, onClose }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('png')
  const [scale, setScale] = useState<ExportScale>(2)
  const [transparent, setTransparent] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [exported, setExported] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  const handleExport = useCallback(async () => {
    if (!commentRef.current) return

    setExporting(true)
    setExported(false)

    try {
      const element = commentRef.current
      const canvas = await html2canvas(element, {
        scale: scale,
        backgroundColor: transparent ? null : '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false,
      })

      canvas.toBlob((blob) => {
        if (!blob) {
          setExporting(false)
          return
        }

        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
        setExporting(false)
        setExported(true)

        // Auto-download
        downloadBlob(blob, `youtube-comment-${Date.now()}.${format}`)
      }, formats.find(f => f.format === format)?.mime || 'image/png')
    } catch (err) {
      console.error('Export error:', err)
      setExporting(false)
    }
  }, [commentRef, format, scale, transparent])

  const handleDownload = useCallback(() => {
    if (previewUrl) {
      const a = document.createElement('a')
      a.href = previewUrl
      a.download = `youtube-comment-${Date.now()}.${format}`
      a.click()
    }
  }, [previewUrl, format])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleBackdropClick}
    >
      <motion.div
        ref={dialogRef}
        className="bg-white dark:bg-[#212121] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#444] w-[480px] max-w-[95vw] max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#333]">
          <h2 className="text-lg font-medium text-gray-900 dark:text-[#f1f1f1]">Exportar Comentário</h2>
          <motion.button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#333] rounded-lg transition-colors text-gray-500 dark:text-[#888]"
            whileTap={{ scale: 0.9 }}
          >
            <X size={18} />
          </motion.button>
        </div>

        <div className="p-4 space-y-5">
          {/* Format Select */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-[#aaa] mb-2 block">Formato</label>
            <div className="grid grid-cols-3 gap-2">
              {formats.map(({ format: f, label, icon: Icon }) => (
                <motion.button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${
                    format === f
                      ? 'border-[#1a73e8] dark:border-[#8ab4f8] bg-[#e8f0fe] dark:bg-[#263850]'
                      : 'border-gray-200 dark:border-[#333] hover:border-gray-300 dark:hover:border-[#555]'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={20} className={format === f ? 'text-[#1a73e8] dark:text-[#8ab4f8]' : 'text-gray-500 dark:text-[#888]'} />
                  <span className={`text-sm font-medium ${format === f ? 'text-[#1a73e8] dark:text-[#8ab4f8]' : 'text-gray-700 dark:text-[#ccc]'}`}>
                    {label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Scale Select */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-[#aaa] mb-2 block">Escala</label>
            <div className="flex gap-2">
              {scales.map((s) => (
                <motion.button
                  key={s}
                  onClick={() => setScale(s)}
                  className={`flex-1 p-2.5 rounded-xl border-2 transition-all text-center ${
                    scale === s
                      ? 'border-[#1a73e8] dark:border-[#8ab4f8] bg-[#e8f0fe] dark:bg-[#263850]'
                      : 'border-gray-200 dark:border-[#333] hover:border-gray-300 dark:hover:border-[#555]'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={`text-sm font-medium ${scale === s ? 'text-[#1a73e8] dark:text-[#8ab4f8]' : 'text-gray-700 dark:text-[#ccc]'}`}>
                    {s}x
                  </div>
                  <div className={`text-[11px] ${scale === s ? 'text-[#1a73e8]/70 dark:text-[#8ab4f8]/70' : 'text-gray-400 dark:text-[#777]'}`}>
                    {s === 1 ? 'HD' : s === 2 ? '2K' : s === 4 ? '4K' : '8K'}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Transparent Background */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-[#ccc]">Fundo Transparente</div>
              <div className="text-xs text-gray-400 dark:text-[#888]">Apenas PNG e WEBP</div>
            </div>
            <motion.button
              onClick={() => setTransparent(!transparent)}
              className={`w-12 h-7 rounded-full transition-all duration-300 flex items-center px-0.5 ${
                transparent
                  ? 'bg-[#1a73e8] dark:bg-[#8ab4f8] justify-end'
                  : 'bg-gray-300 dark:bg-[#555] justify-start'
              } ${format === 'jpg' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </motion.button>
          </div>

          {/* Preview & Export */}
          <div className="space-y-3">
            {previewUrl && (
              <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-[#333] bg-gray-50 dark:bg-[#1a1a1a]">
                <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-[200px] object-contain" />
              </div>
            )}

            <div className="flex gap-2">
              <motion.button
                onClick={handleExport}
                disabled={exporting}
                className="flex-1 py-2.5 bg-[#1a73e8] dark:bg-[#8ab4f8] text-white dark:text-[#202124] rounded-xl text-sm font-medium hover:bg-[#1557b0] dark:hover:bg-[#aecbfa] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                whileTap={{ scale: 0.95 }}
              >
                {exporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Exportando...
                  </>
                ) : exported ? (
                  <>
                    <Check size={16} />
                    Exportado!
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Exportar {format.toUpperCase()} {scale}x
                  </>
                )}
              </motion.button>

              {previewUrl && (
                <motion.button
                  onClick={handleDownload}
                  className="px-4 py-2.5 border border-gray-200 dark:border-[#333] rounded-xl text-sm font-medium text-gray-700 dark:text-[#ccc] hover:bg-gray-50 dark:hover:bg-[#333] transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  <Download size={16} />
                </motion.button>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-400 dark:text-[#777] text-center">
            Para máxima qualidade, use Playwright no backend (em breve)
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
