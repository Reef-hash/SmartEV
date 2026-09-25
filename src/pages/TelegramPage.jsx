import { useState } from 'react'
import { apiPost } from '../api.js'
import StatusMessage from '../components/StatusMessage.jsx'

// Sent through the Apps Script backend so the bot token never reaches the browser.
function TelegramPage({ theme }) {
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [isSending, setIsSending] = useState(false)

  const hantarMesej = async () => {
    if (!message.trim()) {
      setStatus({ type: 'error', message: 'Sila tulis mesej dahulu!' })
      return
    }

    setIsSending(true)
    setStatus({ type: 'idle', message: 'Sedang menghantar...' })

    try {
      const resultText = await apiPost({ type: 'telegram', message: message.trim() })
      if (resultText.includes('Telegram Success')) {
        setStatus({ type: 'success', message: 'Mesej berjaya dihantar!' })
        setMessage('')
      } else {
        setStatus({ type: 'error', message: `Gagal: ${resultText}` })
      }
    } catch (error) {
      setStatus({ type: 'error', message: `Ralat: ${error.message}` })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className={`rounded-3xl border p-6 shadow-2xl backdrop-blur-lg sm:p-8 ${theme.panel}`}>
        <div className="mb-6 text-center">
          <h2 className={`font-display text-3xl text-slate-900 ${theme.heading}`}>Telegram Messenger</h2>
          <p className="mt-2 text-sm text-slate-500">Mesej dihantar ke kumpulan stor melalui bot sistem.</p>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="tg-message" className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-700">
              Mesej
            </label>
            <textarea
              id="tg-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Tulis mesej anda di sini..."
              rows={5}
              className={`w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:bg-white focus:ring-4 ${theme.inputFocus}`}
            />
          </div>

          <button
            type="button"
            onClick={hantarMesej}
            disabled={isSending}
            className={`w-full rounded-xl px-5 py-3.5 text-sm font-bold uppercase tracking-[0.16em] text-white transition disabled:cursor-not-allowed disabled:bg-slate-400 ${theme.accent}`}
          >
            {isSending ? 'Menghantar...' : 'Hantar Mesej'}
          </button>

          <StatusMessage status={status} className="text-center" />
        </div>
      </div>
    </div>
  )
}

export default TelegramPage
