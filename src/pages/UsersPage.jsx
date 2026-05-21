import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Search, RefreshCw, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES = ['traveller', 'admin', 'super_admin']

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('id,full_name,email,role,created_at,avatar_url')
      .order('created_at', { ascending: false })
      .limit(50)
    setUsers(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const updateRole = async (userId, role) => {
    setUpdating(userId)
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
    if (error) { toast.error('Failed to update role'); }
    else { toast.success('Role updated'); setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u)) }
    setUpdating(null)
  }

  const filtered = users.filter(u =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const roleColor = (r) => r === 'super_admin' ? 'bg-red-100 text-red-600' : r === 'admin' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Users</h1>
          <p className="text-slate-500 text-sm mt-1">{users.length} total users</p>
        </div>
        <button onClick={fetchUsers} className="btn-secondary flex items-center gap-2">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-9"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-th">User</th>
              <th className="table-th">Email</th>
              <th className="table-th">Role</th>
              <th className="table-th">Joined</th>
              <th className="table-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="table-td">
                      <div className="h-4 bg-slate-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="table-td text-center text-slate-400 py-10">
                  No users found.
                </td>
              </tr>
            ) : (
              filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.avatar_url
                          ? <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                          : (u.full_name?.[0]?.toUpperCase() || '?')}
                      </div>
                      <span className="font-medium text-slate-700">{u.full_name || '—'}</span>
                    </div>
                  </td>
                  <td className="table-td text-slate-500">{u.email}</td>
                  <td className="table-td">
                    <span className={`badge ${roleColor(u.role)}`}>{u.role?.replace('_', ' ')}</span>
                  </td>
                  <td className="table-td text-slate-400 text-xs">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="table-td">
                    <div className="relative inline-block">
                      <select
                        value={u.role || 'traveller'}
                        onChange={e => updateRole(u.id, e.target.value)}
                        disabled={updating === u.id}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer disabled:opacity-50 appearance-none pr-7"
                      >
                        {ROLES.map(r => (
                          <option key={r} value={r}>{r.replace('_', ' ')}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
