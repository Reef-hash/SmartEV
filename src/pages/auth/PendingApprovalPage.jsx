import { useState } from 'react'
import useAuth from '../../auth/useAuth.js'
import StatusMessage from '../../components/StatusMessage.jsx'

// Shown for accounts that are 'pending' (awaiting admin approval) or 'disabled'.
function PendingApprovalPage({ theme }) {
  const { profile, signOut, refreshProfile } = useAuth()
  const [isChecking, setIsChecking] = useState(false)
  const [status, setStatus] = useState({ type: 'idle', message: '' })

  const isDisabled = profile?.status === 'disabled'

  async function handleRefresh() {
    setIsChecking(true)
    setStatus({ type: 'idle', message: '' })
    await refreshProfile()
    setStatus({ type: 'idle', message: 'Status disemak semula.' })
    setIsChecking(false)
  }

  return (
    <div className="mx-auto max-w-md">
      <div className={`rounded-3xl border p-6 text-center shadow-2xl backdrop-blur-lg sm:p-8 ${theme.panel}`}>
        <div className="mb-4 text-5xl">{isDisabled ? '🚫' : '⏳'}</div>
        <h2 className={`font-display text-2xl text-slate-900 ${theme.heading}`}>
          {isDisabled ? 'Akaun Dinyahaktifkan' : 'Menunggu Kelulusan'}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {isDisabled
            ? 'Akaun anda telah dinyahaktifkan oleh admin. Hubungi admin sistem untuk maklumat lanjut.'
            : 'Akaun anda telah berjaya didaftar dan sedang menunggu kelulusan admin. Sila cuba lagi sebentar.'}
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {!isDisabled && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isChecking}
              className={`w-full rounded-xl px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition disabled:cursor-not-allowed disabled:bg-slate-400 ${theme.accent}`}
            >
              {isChecking ? 'Menyemak...' : 'Semak Semula'}
            </button>
          )}
          <button
            type="button"
            onClick={signOut}
            className="w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-slate-700 transition hover:bg-slate-50"
          >
            Log Keluar
          </button>
        </div>

        <StatusMessage status={status} className="mt-4 text-center" />
      </div>
    </div>
  )
}

export default PendingApprovalPage
