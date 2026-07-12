import { motion } from 'framer-motion'
import {
  Palette,
  Square,
  MoveHorizontal,
  ZoomIn,
  Layers,
  Blend,
  Image,
  Droplets,
  Sun,
  Moon,
} from 'lucide-react'
import type { CanvasSettings, ThemeMode } from '../types'

interface SidebarRightProps {
  canvas: CanvasSettings
  theme: ThemeMode
  onUpdateCanvas: (field: keyof CanvasSettings, value: unknown) => void
  onThemeChange: (theme: ThemeMode) => void
}

function ColorInput({
  label,
  value,
  onChange,
  icon: Icon,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  icon: React.ElementType
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-500 dark:text-[#888] flex items-center gap-1.5">
        <Icon size={12} />
        {label}
      </label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded-lg border border-gray-200 dark:border-[#333] cursor-pointer bg-transparent p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-[#eee] font-mono focus:border-[#ff4444] outline-none transition-all"
        />
      </div>
    </div>
  )
}

function RangeSlider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  icon: Icon,
  suffix = '',
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  icon: React.ElementType
  suffix?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-500 dark:text-[#888] flex items-center gap-1.5">
        <Icon size={12} />
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="range"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="flex-1 h-1.5 bg-gray-200 dark:bg-[#444] rounded-full appearance-none cursor-pointer accent-[#ff4444] dark:accent-[#ff4444]"
        />
        <span className="text-xs font-mono text-gray-500 dark:text-[#aaa] min-w-[40px] text-right">
          {value}{suffix}
        </span>
      </div>
    </div>
  )
}

function SelectButton({
  label,
  value,
  options,
  onChange,
  icon: Icon,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
  icon: React.ElementType
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-500 dark:text-[#888] flex items-center gap-1.5">
        <Icon size={12} />
        {label}
      </label>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <motion.button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-2.5 py-1.5 text-xs rounded-lg border transition-all ${
              value === opt.value
                ? 'bg-red-50 dark:bg-red-900/20 border-[#ff4444]/30 dark:border-[#ff4444]/30 text-[#ff4444] dark:text-[#ff4444] font-medium'
                : 'border-gray-200 dark:border-[#333] text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:hover:bg-[#252525]'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {opt.label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export function SidebarRight({ canvas, theme, onUpdateCanvas, onThemeChange }: SidebarRightProps) {
  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="p-4 space-y-5">
        {/* Theme */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-[#666] mb-3 flex items-center gap-1.5">
            <Sun size={12} />
            Tema
          </h3>
          <div className="flex gap-2">
            {[
              { value: 'light', label: 'Claro', icon: Sun },
              { value: 'dark', label: 'Escuro', icon: Moon },
              { value: 'auto', label: 'Auto', icon: Blend },
            ].map(({ value, label, icon: Icon }) => (
              <motion.button
                key={value}
                onClick={() => onThemeChange(value as ThemeMode)}
                className={`flex-1 p-2.5 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                  theme === value
                    ? 'border-[#ff4444] dark:border-[#ff4444] bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-[#333] hover:border-gray-300 dark:hover:border-[#555]'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={16} className={theme === value ? 'text-[#ff4444] dark:text-[#ff4444]' : 'text-gray-500 dark:text-[#888]'} />
                <span className={`text-xs font-medium ${theme === value ? 'text-[#ff4444] dark:text-[#ff4444]' : 'text-gray-600 dark:text-[#aaa]'}`}>
                  {label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        <hr className="border-gray-200 dark:border-[#333]" />

        {/* Background */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-[#666] mb-3 flex items-center gap-1.5">
            <Image size={12} />
            Background
          </h3>

          <SelectButton
            label="Tipo"
            value={canvas.backgroundType}
            options={[
              { value: 'solid', label: 'Sólida' },
              { value: 'gradient', label: 'Gradiente' },
              { value: 'transparent', label: 'Transparente' },
            ]}
            onChange={(v) => onUpdateCanvas('backgroundType', v)}
            icon={Layers}
          />

          {canvas.backgroundType === 'solid' && (
            <ColorInput label="Cor" value={canvas.backgroundColor} onChange={(v) => onUpdateCanvas('backgroundColor', v)} icon={Palette} />
          )}

          {canvas.backgroundType === 'gradient' && (
            <>
              <ColorInput label="Início" value={canvas.gradientStart || '#667eea'} onChange={(v) => onUpdateCanvas('gradientStart', v)} icon={Droplets} />
              <ColorInput label="Fim" value={canvas.gradientEnd || '#764ba2'} onChange={(v) => onUpdateCanvas('gradientEnd', v)} icon={Droplets} />
              <RangeSlider label="Ângulo" value={canvas.gradientAngle || 45} onChange={(v) => onUpdateCanvas('gradientAngle', v)} min={0} max={360} icon={MoveHorizontal} suffix="°" />
            </>
          )}

          <RangeSlider label="Blur" value={canvas.blur} onChange={(v) => onUpdateCanvas('blur', v)} min={0} max={20} step={0.5} icon={Blend} suffix="px" />
        </div>

        <hr className="border-gray-200 dark:border-[#333]" />

        {/* Card Style */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-[#666] mb-3 flex items-center gap-1.5">
            <Square size={12} />
            Card
          </h3>

          <ColorInput label="Fundo" value={canvas.cardBackgroundColor} onChange={(v) => onUpdateCanvas('cardBackgroundColor', v)} icon={Palette} />
          <ColorInput label="Borda" value={canvas.cardBorderColor} onChange={(v) => onUpdateCanvas('cardBorderColor', v)} icon={Square} />

          <RangeSlider label="Largura" value={canvas.cardBorderWidth} onChange={(v) => onUpdateCanvas('cardBorderWidth', v)} min={0} max={5} icon={Square} suffix="px" />
          <RangeSlider label="Arredondamento" value={canvas.cardBorderRadius} onChange={(v) => onUpdateCanvas('cardBorderRadius', v)} min={0} max={24} icon={Square} suffix="px" />
          <RangeSlider label="Padding" value={canvas.cardPadding} onChange={(v) => onUpdateCanvas('cardPadding', v)} min={8} max={48} icon={MoveHorizontal} suffix="px" />
          <RangeSlider label="Escala" value={canvas.scale * 100} onChange={(v) => onUpdateCanvas('scale', v / 100)} min={25} max={200} step={5} icon={ZoomIn} suffix="%" />

          {/* Shadow presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-[#888] flex items-center gap-1.5">
              <Square size={12} />
              Sombra
            </label>
            <div className="flex flex-wrap gap-1">
              {[
                { value: 'none', label: 'Sem' },
                { value: '0 1px 3px rgba(0,0,0,0.08)', label: 'Suave' },
                { value: '0 2px 8px rgba(0,0,0,0.08)', label: 'Média' },
                { value: '0 4px 16px rgba(0,0,0,0.1)', label: 'Forte' },
                { value: '0 8px 32px rgba(0,0,0,0.12)', label: 'Máxima' },
              ].map(({ value: shadow, label }) => (
                <motion.button
                  key={label}
                  onClick={() => onUpdateCanvas('cardShadow', shadow)}
                  className={`px-2.5 py-1.5 text-xs rounded-lg border transition-all ${
                    canvas.cardShadow === shadow
                      ? 'bg-red-50 dark:bg-red-900/20 border-[#ff4444]/30 dark:border-[#ff4444]/30 text-[#ff4444] dark:text-[#ff4444] font-medium'
                      : 'border-gray-200 dark:border-[#333] text-gray-600 dark:text-[#aaa] hover:bg-gray-50 dark:hover:bg-[#252525]'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <hr className="border-gray-200 dark:border-[#333]" />

        {/* Grid */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-[#666] mb-3 flex items-center gap-1.5">
            Grid
          </h3>
          <RangeSlider label="Tamanho" value={canvas.gridSize} onChange={(v) => onUpdateCanvas('gridSize', v)} min={10} max={100} step={5} icon={Layers} suffix="px" />
          <ColorInput label="Cor" value={canvas.gridColor} onChange={(v) => onUpdateCanvas('gridColor', v)} icon={Palette} />
        </div>
      </div>
    </div>
  )
}
