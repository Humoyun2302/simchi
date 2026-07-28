import { cn } from '@/lib/utils'
import type { TextareaHTMLAttributes } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ className, label, error, ...props }: TextareaProps) {
  return (
    <label className="flex flex-col gap-1.5 w-full">
      {label ? <span className="text-sm font-medium text-text/80">{label}</span> : null}
      <textarea
        className={cn(
          'w-full min-h-28 rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-text outline-none placeholder:text-muted/70 focus:ring-2 focus:ring-primary/30 resize-y',
          error && 'ring-2 ring-danger-text/30',
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-danger-text">{error}</span> : null}
    </label>
  )
}
