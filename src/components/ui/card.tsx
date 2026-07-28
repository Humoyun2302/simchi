import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('glass rounded-[28px] p-5', className)} {...props} />
}

export function Badge({
  className,
  tone = 'neutral',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: 'neutral' | 'success' | 'danger' | 'warning' | 'primary' }) {
  const tones = {
    neutral: 'bg-white/80 text-muted',
    success: 'bg-success text-success-text',
    danger: 'bg-danger text-danger-text',
    warning: 'bg-warning text-warning-text',
    primary: 'bg-primary-soft text-primary',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-white/60', className)} />
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary',
        className,
      )}
    />
  )
}
