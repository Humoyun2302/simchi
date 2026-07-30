import { useEffect, useRef, useState, type WheelEvent } from 'react'

export type NumericMode = 'integer' | 'decimal'

export interface UseNumericInputOptions {
  value: number | null | undefined
  onCommit: (value: number | null) => void
  mode: NumericMode
}

function formatFromNumber(value: number | null | undefined, mode: NumericMode): string {
  if (value === null || value === undefined || Number.isNaN(value)) return ''
  if (mode === 'integer') return String(Math.trunc(value))
  return String(value)
}

function sanitizeInteger(raw: string): string {
  return raw.replace(/[^\d]/g, '')
}

function sanitizeDecimal(raw: string): string {
  const normalized = raw.replace(/,/g, '.')
  let out = ''
  let seenDot = false
  for (const ch of normalized) {
    if (ch >= '0' && ch <= '9') {
      out += ch
      continue
    }
    if (ch === '.' && !seenDot) {
      out += '.'
      seenDot = true
    }
  }
  return out
}

function parseCommitted(text: string, mode: NumericMode): number | null {
  const trimmed = text.trim()
  if (trimmed === '' || trimmed === '.') return null

  const n = mode === 'integer' ? Number.parseInt(trimmed, 10) : Number.parseFloat(trimmed.replace(/,/g, '.'))
  if (!Number.isFinite(n) || Number.isNaN(n)) return null

  return mode === 'integer' ? Math.trunc(n) : n
}

/**
 * Keeps the editable value as a string while focused so Backspace can clear
 * without React immediately restoring 0/1 from Number(value) || fallback.
 */
export function useNumericInput({ value, onCommit, mode }: UseNumericInputOptions) {
  const [text, setText] = useState(() => formatFromNumber(value, mode))
  const focusedRef = useRef(false)

  useEffect(() => {
    if (!focusedRef.current) {
      setText(formatFromNumber(value, mode))
    }
  }, [value, mode])

  const onFocus = () => {
    focusedRef.current = true
  }

  const onChange = (raw: string) => {
    const next = mode === 'integer' ? sanitizeInteger(raw) : sanitizeDecimal(raw)
    setText(next)
  }

  const onBlur = () => {
    focusedRef.current = false
    const parsed = parseCommitted(text, mode)
    if (parsed === null) {
      setText('')
      onCommit(null)
      return
    }
    setText(formatFromNumber(parsed, mode))
    onCommit(parsed)
  }

  /** Commit current text without requiring blur (step next / submit). */
  const commitNow = (): number | null => {
    const parsed = parseCommitted(text, mode)
    if (parsed === null) {
      setText('')
      onCommit(null)
      return null
    }
    setText(formatFromNumber(parsed, mode))
    onCommit(parsed)
    return parsed
  }

  const blockWheel = (e: WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur()
  }

  return {
    text,
    inputMode: (mode === 'integer' ? 'numeric' : 'decimal') as 'numeric' | 'decimal',
    onFocus,
    onChange,
    onBlur,
    commitNow,
    blockWheel,
    isEmpty: text.trim() === '',
  }
}

export function parseDecimalInput(raw: string): number | null {
  return parseCommitted(raw, 'decimal')
}

export function parseIntegerInput(raw: string): number | null {
  return parseCommitted(raw, 'integer')
}
