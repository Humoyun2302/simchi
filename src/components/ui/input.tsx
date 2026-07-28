import { cn } from '@/lib/utils'
import type { InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ className, label, error, id, ...props }: InputProps) {
  const inputId = id || props.name
  return (
    <label className="flex flex-col gap-1.5 w-full">
      {label ? <span className="text-sm font-medium text-text/80">{label}</span> : null}
      <input
        id={inputId}
        className={cn(
          'w-full min-h-12 rounded-2xl border border-white/80 bg-white/70 px-4 text-text outline-none placeholder:text-muted/70 focus:ring-2 focus:ring-primary/30',
          error && 'ring-2 ring-danger-text/30',
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-danger-text">{error}</span> : null}
    </label>
  )
}
