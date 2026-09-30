import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import useAuth from '../auth/useAuth.js'
import StatusMessage from '../components/StatusMessage.jsx'

const STATUS_BADGE = {
  active: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  disabled: 'bg-rose-100 text-rose-700',
}

function UsersPage({ theme }) {
  const { profile } = useAuth()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState({ type: 'idle', message: '' })

  async function fetchProfiles() {
    setIsLoading(true)
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (error) {
      setStatus({ type: 'error', message: `Gagal memuat senarai pengguna: ${error.message}` })
      setUsers([])
    } else {
      setUsers(data || [])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    const t = setTimeout(() => { fetchProfiles() }, 0)
    return () => clearTimeout(t)
  }, [])

  async function setAccess(id, role, newStatus) {
    const { error } = await supabase.rpc('admin_set_access', { target: id, new_role: role, new_status: newStatus })
    if (error) {
      setStatus({ type: 'error', message: error.message })
    } else {
      setStatus({ type: 'success', message: 'Akaun dikemaskini.' })
      fetchProfiles()
    }
  }

  const pending = users.filter((u) => u.status === 'pending')
  const others = users.filter((u) => u.status !== 'pending')

  const rowActions = (u) => (
    <div className="flex flex-wrap gap-2">
      {u.status === 'pending' && (
        <button
          type="button"
          onClick={() => setAccess(u.id, 'staff', 'active')}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-emerald-700"
        >
          Lulus (Staff)
        </button>
      )}
      {u.role !== 'storekeeper' && (
        <button
          type="button"
          onClick={() => setAccess(u.id, 'storekeeper', 'active')}
          className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-amber-600"
        >
          Jadikan Storekeeper
        </button>
      )}
      {u.role !== 'admin' && (
        <button
          type="button"
          onClick={() => setAccess(u.id, 'admin', 'active')}
          className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-slate-800"
        >
          Jadikan Admin
        </button>
      )}
      {u.id !== profile?.id && (
        <button
          type="button"
          onClick={() => setAccess(u.id, u.role, u.status === 'disabled' ? 'active' : 'disabled')}
          className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-rose-700"
        >
          {u.status === 'disabled' ? 'Aktifkan' : 'Nyahaktifkan'}
        </button>
      )}
    </div>
  )

  return (
    <div className="mx-auto max-w-4xl">
      <div className={`rounded-3xl border p-6 shadow-2xl backdrop-blur-lg sm:p-8 ${theme.panel}`}>
        <div className="mb-6 text-center">
          <h2 className={`font-display text-3xl text-slate-900 ${theme.heading}`}>Pengurusan Pengguna</h2>
          <p className="mt-2 text-sm text-slate-500">Luluskan akaun baru, ubah peranan, atau nyahaktifkan akaun.</p>
        </div>

        <StatusMessage status={status} className="mb-4 text-center" />

        {isLoading ? (
          <p className="text-center text-sm text-slate-500">Memuat...</p>
        ) : (
          <div className="space-y-8">
            {pending.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-amber-700">Menunggu Kelulusan ({pending.length})</h3>
                <div className="space-y-3">
                  {pending.map((u) => (
                    <div key={u.id} className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-900">{u.full_name || '(tiada nama)'}</p>
                          <p className="text-sm text-slate-500">{u.email}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${STATUS_BADGE[u.status]}`}>{u.status}</span>
                      </div>
                      {rowActions(u)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Semua Pengguna</h3>
              <div className="space-y-3">
                {others.map((u) => (
                  <div key={u.id} className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900">{u.full_name || '(tiada nama)'}</p>
                        <p className="text-sm text-slate-500">{u.email} &middot; {u.role}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${STATUS_BADGE[u.status]}`}>{u.status}</span>
                    </div>
                    {rowActions(u)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UsersPage
