import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export function Logo({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'text-lg gap-2',
    md: 'text-2xl gap-2.5',
    lg: 'text-4xl gap-3',
  }
  const icon = {
    sm: 18,
    md: 24,
    lg: 34,
  }[size]

  return (
    <div className={cn('inline-flex items-center font-extrabold tracking-tight text-text', sizes[size], className)}>
      <svg width={icon} height={icon} viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="8" cy="16" r="3.2" fill="#3F7FF1" />
        <circle cx="24" cy="8" r="2.6" fill="#3F7FF1" opacity="0.85" />
        <circle cx="24" cy="24" r="2.6" fill="#3F7FF1" opacity="0.85" />
        <path d="M11 16H18.5M18.5 16L22.5 9.5M18.5 16L22.5 22.5" stroke="#3F7FF1" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <span>SIMCHI</span>
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="glass rounded-[28px] px-6 py-12 text-center">
      <h3 className="text-lg font-bold text-text">{title}</h3>
      {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-tight text-text sm:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted sm:text-base">{subtitle}</p> : null}
      </div>
      {actions ? <div className="w-full sm:w-auto">{actions}</div> : null}
    </div>
  )
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="glass min-w-0 rounded-[22px] p-3.5 sm:rounded-[28px] sm:p-4">
      <p className="text-xs text-muted sm:text-sm">{label}</p>
      <p className="mt-1.5 text-base font-extrabold leading-tight text-text sm:mt-2 sm:text-2xl">{value}</p>
      {hint ? <p className="mt-1 text-xs font-medium text-primary">{hint}</p> : null}
    </div>
  )
}

export function FilterPills({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: string; label: string }>
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:px-0">
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'shrink-0 whitespace-nowrap rounded-full px-4 min-h-10 text-sm font-semibold transition active:scale-[0.98]',
              active ? 'bg-primary text-white shadow-md' : 'bg-white/70 text-muted',
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      enterKeyHint="search"
      className="w-full min-h-12 rounded-full border border-white/80 bg-white/70 px-5 text-text outline-none placeholder:text-muted/70 focus:ring-2 focus:ring-primary/25"
    />
  )
}
