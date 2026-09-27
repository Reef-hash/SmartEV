import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMsg(error.message)
    else setMsg('Berjaya log masuk')
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Log Masuk</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm">Emel</label>
          <input value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm">Kata Laluan</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Log Masuk</button>
        </div>
      </form>
      {msg && <p className="mt-3">{msg}</p>}
    </div>
  )
}
