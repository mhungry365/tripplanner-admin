import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import { User, Lock, Globe, Bell, Shield, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { profile } = useAuthStore()
  const [tab, setTab] = useState('profile')
  const [name, setName] = useState(profile?.full_name || '')
  const [saving, setSaving] = useState(false)
  const [oldPw, setOldPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'site', label: 'Site Settings', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('profiles').update({ full_name: name }).eq('id', profile?.id)
    setSaving(false)
    if (error) toast.error(error.message)
    else { toast.success('Profile updated'); useAuthStore.setState(s => ({ profile: { ...s.profile, full_name: name } })) }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return }
    if (newPw.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPw })
    setSaving(false)
    if (error) toast.error(error.message)
    else { toast.success('Password changed'); setOldPw(''); setNewPw(''); setConfirmPw('') }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your admin account and site configuration</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-48 flex-shrink-0 space-y-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                tab === id ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="flex-1">
          {tab === 'profile' && (
            <div className="card max-w-lg">
              <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><User size={16} className="text-orange-500" /> Profile</h2>
              <form onSubmit={saveProfile} className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input className="input" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input bg-slate-50" value={profile?.email || ''} disabled />
                </div>
                <div>
                  <label className="label">Role</label>
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-orange-500" />
                    <span className="text-sm font-semibold text-orange-600 capitalize">{profile?.role?.replace('_', ' ')}</span>
                  </div>
                </div>
                <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
                  <Save size={14} /> {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            </div>
          )}

          {tab === 'security' && (
            <div className="card max-w-lg">
              <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><Lock size={16} className="text-orange-500" /> Change Password</h2>
              <form onSubmit={changePassword} className="space-y-4">
                <div>
                  <label className="label">New Password</label>
                  <input type="password" className="input" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="••••••••" />
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <input type="password" className="input" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••" />
                </div>
                <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
                  <Lock size={14} /> {saving ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {tab === 'site' && (
            <div className="card max-w-lg space-y-6">
              <h2 className="font-semibold text-slate-700 flex items-center gap-2"><Globe size={16} className="text-orange-500" /> Site Settings</h2>
              <div className="space-y-4">
                {[
                  { label: 'App Name', value: 'HolidaysDairy', desc: 'Displayed in the header and emails' },
                  { label: 'Support Email', value: 'support@holidaysdairy.app', desc: 'Receives user support messages' },
                  { label: 'Max Trips Per User', value: '20', desc: 'Free tier limit' },
                ].map(({ label, value, desc }) => (
                  <div key={label}>
                    <label className="label">{label}</label>
                    <input className="input" defaultValue={value} />
                    <p className="text-xs text-slate-400 mt-1">{desc}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between py-3 border-t border-slate-100">
                  <div>
                    <div className="text-sm font-medium text-slate-700">Maintenance Mode</div>
                    <div className="text-xs text-slate-400">Disables user login temporarily</div>
                  </div>
                  <button className="relative w-10 h-5 rounded-full bg-slate-200 transition-colors focus:outline-none">
                    <span className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform" />
                  </button>
                </div>
              </div>
              <button className="btn-primary flex items-center gap-2">
                <Save size={14} /> Save Settings
              </button>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="card max-w-lg space-y-5">
              <h2 className="font-semibold text-slate-700 flex items-center gap-2"><Bell size={16} className="text-orange-500" /> Notification Preferences</h2>
              {[
                { label: 'New user registrations', desc: 'Get notified when a new user signs up' },
                { label: 'Support tickets', desc: 'Alert when a new ticket is submitted' },
                { label: 'Weekly digest', desc: 'Summary of platform stats every Monday' },
                { label: 'Security alerts', desc: 'Notify on suspicious login attempts' },
              ].map(({ label, desc }, i) => (
                <div key={label} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-slate-700">{label}</div>
                    <div className="text-xs text-slate-400">{desc}</div>
                  </div>
                  <button className={`relative w-10 h-5 rounded-full transition-colors focus:outline-none ${i < 3 ? 'bg-orange-500' : 'bg-slate-200'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${i < 3 ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
              <button className="btn-primary flex items-center gap-2">
                <Save size={14} /> Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
