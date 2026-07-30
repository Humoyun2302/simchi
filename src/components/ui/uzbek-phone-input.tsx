import { useEffect, useRef, useState, type ClipboardEvent, type InputHTMLAttributes } from 'react'
import {
  extractUzbekLocalDigits,
  formatUzbekPhone,
  normalizeUzbekPhone,
} from '@/lib/phone'
import { cn } from '@/lib/utils'

export interface UzbekPhoneInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type' | 'inputMode'> {
  label?: string
  error?: string
  /** Stored / controlled value in E.164 or any accepted paste form. */
  value: string
  /** Called with E.164 when complete, or with partial digits string while typing. */
  onValueChange: (e164OrPartial: string) => void
}

/**
 * Uzbekistan phone input.
 * Displays +998 XX XXX XX XX; stores E.164 (+998XXXXXXXXX) when complete.
 */
export function UzbekPhoneInput({
  className,
  label,
  error,
  id,
  value,
  onValueChange,
  ...props
}: UzbekPhoneInputProps) {
  const [localDigits, setLocalDigits] = useState(() => extractUzbekLocalDigits(value))
  const focusedRef = useRef(false)
  const inputId = id || props.name

  useEffect(() => {
    if (!focusedRef.current) {
      setLocalDigits(extractUzbekLocalDigits(value))
    }
  }, [value])

  const display = formatUzbekPhone(localDigits)

  const commitDigits = (digits: string) => {
    setLocalDigits(digits)
    const e164 = normalizeUzbekPhone(digits)
    onValueChange(e164 ?? (digits ? `+998${digits}` : ''))
  }

  const handleChange = (raw: string) => {
    // User edits the formatted field; re-extract local digits
    commitDigits(extractUzbekLocalDigits(raw))
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text')
    commitDigits(extractUzbekLocalDigits(pasted))
  }

  return (
    <label className="flex w-full flex-col gap-1.5">
      {label ? <span className="text-sm font-medium text-text/80">{label}</span> : null}
      <input
        {...props}
        id={inputId}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={display}
        onFocus={() => {
          focusedRef.current = true
        }}
        onBlur={() => {
          focusedRef.current = false
          const e164 = normalizeUzbekPhone(localDigits)
          if (e164) onValueChange(e164)
          setLocalDigits(extractUzbekLocalDigits(e164 ?? localDigits))
        }}
        onChange={(e) => handleChange(e.target.value)}
        onPaste={handlePaste}
        className={cn(
          'w-full min-h-12 rounded-2xl border border-white/80 bg-white/70 px-4 text-text outline-none placeholder:text-muted/70 focus:ring-2 focus:ring-primary/30',
          error && 'ring-2 ring-danger-text/30',
          className,
        )}
        placeholder="+998 90 123 45 67"
      />
      {error ? <span className="text-xs text-danger-text">{error}</span> : null}
    </label>
  )
}
