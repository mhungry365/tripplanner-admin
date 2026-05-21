import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Users, MapPin, TrendingUp, Activity } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const mockSignups = [
  { month: 'Jan', users: 12 }, { month: 'Feb', users: 18 }, { month: 'Mar', users: 25 },
  { month: 'Apr', users: 31 }, { month: 'May', users: 45 }, { month: 'Jun', users: 52 },
]

export default function DashboardPage() {
  const [stats, setStats] = useState({ users: 0, destinations: 0, trips: 0, admins: 0 })
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [usersRes, destRes, tripsRes, adminsRes, recentRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('destinations').select('id', { count: 'exact', head: true }),
        supabase.from('trips').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).in('role', ['admin', 'super_admin']),
        supabase.from('profiles').select('id,full_name,email,role,created_at').order('created_at', { ascending: false }).limit(5),
      ])
      setStats({
        users: usersRes.count ?? 0,
        destinations: destRes.count ?? 0,
        trips: tripsRes.count ?? 0,
        admins: adminsRes.count ?? 0,
      })
      setRecentUsers(recentRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Destinations', value: stats.destinations, icon: MapPin, color: 'bg-green-50 text-green-600' },
    { label: 'Total Trips', value: stats.trips, icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
    { label: 'Admins', value: stats.admins, icon: Activity, color: 'bg-orange-50 text-orange-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back. Here's what's happening.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${color} mb-3`}>
              <Icon size={20} />
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {loading ? <span className="inline-block w-8 h-6 bg-slate-100 rounded animate-pulse" /> : value}
            </div>
            <div className="text-sm text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Chart + Recent Users */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">User Growth</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockSignups}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Area type="monotone" dataKey="users" stroke="#f97316" strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Recent Users</h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentUsers.length === 0 ? (
            <p className="text-slate-400 text-sm">No users found.</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map(u => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {u.full_name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700 truncate">{u.full_name || 'Unknown'}</div>
                    <div className="text-xs text-slate-400 truncate">{u.email}</div>
                  </div>
                  <span className={`badge text-xs ${u.role === 'super_admin' ? 'bg-red-100 text-red-600' : u.role === 'admin' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                    {u.role?.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
