import { cn } from '@/lib/utils'
import type { SelectHTMLAttributes, ReactNode } from 'react'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options?: Array<{ value: string; label: string }>
  children?: ReactNode
}

export function Select({ className, label, error, options, children, ...props }: SelectProps) {
  return (
    <label className="flex flex-col gap-1.5 w-full">
      {label ? <span className="text-sm font-medium text-text/80">{label}</span> : null}
      <select
        className={cn(
          'w-full min-h-12 rounded-2xl border border-white/80 bg-white/70 px-4 text-text outline-none focus:ring-2 focus:ring-primary/30',
          error && 'ring-2 ring-danger-text/30',
          className,
        )}
        {...props}
      >
        {children ??
          options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
      </select>
      {error ? <span className="text-xs text-danger-text">{error}</span> : null}
    </label>
  )
}
