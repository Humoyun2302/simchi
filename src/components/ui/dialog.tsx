import { Button } from './button'

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  danger,
}: {
  open: boolean
  title: string
  description?: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-text/30 p-4 backdrop-blur-sm">
      <div className="glass w-full max-w-md rounded-[28px] p-6">
        <h3 className="text-xl font-bold">{title}</h3>
        {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} className="flex-1" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ToastViewport({
  items,
  onDismiss,
}: {
  items: Array<{ id: string; message: string; kind: string }>
  onDismiss: (id: string) => void
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[90] flex flex-col items-center gap-2 px-4">
      {items.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onDismiss(t.id)}
          className={`pointer-events-auto max-w-md rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg ${
            t.kind === 'success'
              ? 'bg-success text-success-text'
              : t.kind === 'error'
                ? 'bg-danger text-danger-text'
                : 'bg-white text-text'
          }`}
        >
          {t.message}
        </button>
      ))}
    </div>
  )
}
