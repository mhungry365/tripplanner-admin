import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import {
  LayoutDashboard, Users, MapPin, Megaphone,
  HeadphonesIcon, Settings, LogOut, Shield, Menu, X
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

const navItems = [
  { path: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { path: '/users',        label: 'Users',        icon: Users },
  { path: '/destinations', label: 'Destinations', icon: MapPin },
  { path: '/broadcast',    label: 'Broadcast',    icon: Megaphone },
  { path: '/support',      label: 'Support',      icon: HeadphonesIcon },
  { path: '/settings',     label: 'Settings',     icon: Settings },
]

export default function AdminLayout() {
  const { profile, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} flex-shrink-0 bg-white border-r border-slate-100 flex flex-col transition-all duration-200`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-100 gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
            <Shield size={16} className="text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <div className="text-sm font-bold text-slate-800">TripPlanner</div>
              <div className="text-xs text-orange-500 font-semibold">Admin Portal</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="ml-auto text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50"
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-600 border border-orange-100'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User / Sign out */}
        <div className="p-3 border-t border-slate-100">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {profile?.full_name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-700 truncate">{profile?.full_name || 'Admin'}</div>
                <div className="text-xs text-orange-500 font-medium capitalize">{profile?.role?.replace('_', ' ')}</div>
              </div>
              <button onClick={handleSignOut} className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-all">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button onClick={handleSignOut} className="w-full flex justify-center text-slate-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-all">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center px-6 gap-4">
          <h1 className="text-slate-400 text-sm">TripPlanner Admin</h1>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2.5 py-1 rounded-full capitalize">
              {profile?.role?.replace('_', ' ') || 'admin'}
            </span>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
