import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import useAuth from '../auth/useAuth'
import { hasRole } from '../auth/permissions'

export default function UsersPage() {
  const { profile } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchProfiles() {
    setLoading(true)
    const { data, error } = await supabase.from('profiles').select('*')
    if (error) {
      console.error('profiles fetch error', error)
      setUsers([])
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!profile) return
    if (!hasRole(profile, 'admin')) return
    // defer to avoid calling setState synchronously in effect
    const t = setTimeout(() => { fetchProfiles() }, 0)
    return () => clearTimeout(t)
  }, [profile])

  async function setAccess(id, role, status) {
    const { error } = await supabase.rpc('admin_set_access', { target: id, new_role: role, new_status: status })
    if (error) {
      alert('Error: ' + error.message)
    } else {
      fetchProfiles()
    }
  }

  if (!profile) return <div className="p-4">Sila log masuk</div>
  if (!hasRole(profile, 'admin')) return <div className="p-4">Akses ditolak</div>

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Pengurusan Pengguna</h2>
      {loading ? <div>Memuat...</div> : (
        <table className="w-full table-auto border">
          <thead>
            <tr className="text-left">
              <th className="p-2">Email</th>
              <th className="p-2">Nama</th>
              <th className="p-2">Role</th>
              <th className="p-2">Status</th>
              <th className="p-2">Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.full_name}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">{u.status}</td>
                <td className="p-2">
                  {u.status === 'pending' && (
                    <button className="mr-2 bg-green-600 text-white px-2 py-1 rounded" onClick={() => setAccess(u.id, 'staff', 'active')}>Approve</button>
                  )}
                  <button className="mr-2 bg-yellow-600 text-white px-2 py-1 rounded" onClick={() => setAccess(u.id, 'storekeeper', 'active')}>Make Storekeeper</button>
                  <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => setAccess(u.id, u.role, 'disabled')}>Disable</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
