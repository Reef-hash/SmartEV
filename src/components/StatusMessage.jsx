const STATUS_CLASSES = {
  success: 'border-emerald-400/50 bg-emerald-100 text-emerald-800',
  error: 'border-rose-400/50 bg-rose-100 text-rose-800',
  idle: 'border-slate-300/70 bg-slate-50 text-slate-700',
}

// status: { type: 'idle' | 'success' | 'error', message: string }
function StatusMessage({ status, className = '' }) {
  if (!status.message) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={`whitespace-pre-line rounded-xl border px-4 py-3 text-sm font-medium ${STATUS_CLASSES[status.type] ?? STATUS_CLASSES.idle} ${className}`}
    >
      {status.message}
    </div>
  )
}

export default StatusMessage
