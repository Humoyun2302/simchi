import { useEffect, useRef, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomSheet({
  open,
  title,
  onClose,
  children,
  className,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  className?: string
}) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const startY = useRef<number | null>(null)
  const [dragY, setDragY] = useState(0)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) setDragY(0)
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Закрыть"
        className="absolute inset-0 bg-text/35 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ transform: dragY ? `translateY(${dragY}px)` : undefined }}
        className={cn(
          'relative z-[81] flex max-h-[85dvh] w-full max-w-lg flex-col rounded-t-[28px] bg-white shadow-[0_-8px_40px_rgb(16_24_40_/_0.12)] sm:rounded-[28px] sm:max-h-[80vh]',
          className,
        )}
        onTouchStart={(e) => {
          startY.current = e.touches[0]?.clientY ?? null
        }}
        onTouchMove={(e) => {
          if (startY.current == null) return
          const dy = (e.touches[0]?.clientY ?? startY.current) - startY.current
          if (dy > 0) setDragY(dy)
        }}
        onTouchEnd={() => {
          if (dragY > 80) onClose()
          setDragY(0)
          startY.current = null
        }}
      >
        <div className="flex shrink-0 flex-col items-center px-4 pt-3 sm:hidden">
          <div className="h-1.5 w-10 rounded-full bg-muted/30" />
        </div>
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-3 sm:pt-5">
          <h3 className="pr-2 text-lg font-extrabold leading-snug text-text">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>
        <div
          className="overflow-y-auto px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
