import { cn } from '@/lib/utils'
import { useNumericInput } from '@/hooks/useNumericInput'
import type { InputHTMLAttributes } from 'react'

type BaseProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type' | 'inputMode' | 'onBlur' | 'onFocus'
> & {
  label?: string
  error?: string
  value: number | null | undefined
  onValueChange: (value: number | null) => void
}

export function IntegerInput({
  className,
  label,
  error,
  id,
  value,
  onValueChange,
  ...props
}: BaseProps) {
  const numeric = useNumericInput({
    value,
    onCommit: onValueChange,
    mode: 'integer',
  })
  const inputId = id || props.name

  return (
    <label className="flex w-full flex-col gap-1.5">
      {label ? <span className="text-sm font-medium text-text/80">{label}</span> : null}
      <input
        {...props}
        id={inputId}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={numeric.text}
        onFocus={numeric.onFocus}
        onChange={(e) => numeric.onChange(e.target.value)}
        onBlur={numeric.onBlur}
        onWheel={numeric.blockWheel}
        className={cn(
          'w-full min-h-12 rounded-2xl border border-white/80 bg-white/70 px-4 text-text outline-none placeholder:text-muted/70 focus:ring-2 focus:ring-primary/30',
          error && 'ring-2 ring-danger-text/30',
          className,
        )}
      />
      {error ? <span className="text-xs text-danger-text">{error}</span> : null}
    </label>
  )
}

export function DecimalInput({
  className,
  label,
  error,
  id,
  value,
  onValueChange,
  ...props
}: BaseProps) {
  const numeric = useNumericInput({
    value,
    onCommit: onValueChange,
    mode: 'decimal',
  })
  const inputId = id || props.name

  return (
    <label className="flex w-full flex-col gap-1.5">
      {label ? <span className="text-sm font-medium text-text/80">{label}</span> : null}
      <input
        {...props}
        id={inputId}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={numeric.text}
        onFocus={numeric.onFocus}
        onChange={(e) => numeric.onChange(e.target.value)}
        onBlur={numeric.onBlur}
        onWheel={numeric.blockWheel}
        className={cn(
          'w-full min-h-12 rounded-2xl border border-white/80 bg-white/70 px-4 text-text outline-none placeholder:text-muted/70 focus:ring-2 focus:ring-primary/30',
          error && 'ring-2 ring-danger-text/30',
          className,
        )}
      />
      {error ? <span className="text-xs text-danger-text">{error}</span> : null}
    </label>
  )
}
