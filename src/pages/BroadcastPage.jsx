import { useState } from 'react'
import { Megaphone, Send, Users, Bell, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

const TYPES = [
  { id: 'push', label: 'Push Notification', icon: Bell, desc: 'Send to all app users' },
  { id: 'email', label: 'Email Blast', icon: Mail, desc: 'Send to all registered emails' },
  { id: 'in_app', label: 'In-App Banner', icon: Megaphone, desc: 'Display banner in the app' },
]

const mockHistory = [
  { id: 1, type: 'push', title: 'New destinations available!', sent: '2024-01-15', recipients: 2341 },
  { id: 2, type: 'email', title: 'January travel deals', sent: '2024-01-10', recipients: 1892 },
  { id: 3, type: 'in_app', title: 'App update v2.0', sent: '2024-01-05', recipients: 3100 },
]

export default function BroadcastPage() {
  const [type, setType] = useState('push')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async (e) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) { toast.error('Title and message are required'); return }
    setSending(true)
    await new Promise(r => setTimeout(r, 1200))
    toast.success('Broadcast sent successfully!')
    setTitle('')
    setBody('')
    setSending(false)
  }

  const typeColor = (t) => t === 'push' ? 'bg-blue-100 text-blue-600' : t === 'email' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Broadcast</h1>
        <p className="text-slate-500 text-sm mt-1">Send messages to all users</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Compose */}
        <div className="card space-y-5">
          <h2 className="font-semibold text-slate-700 flex items-center gap-2">
            <Send size={16} className="text-orange-500" /> Compose Broadcast
          </h2>

          {/* Type selector */}
          <div className="grid grid-cols-3 gap-2">
            {TYPES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setType(id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                  type === id
                    ? 'border-orange-300 bg-orange-50 text-orange-600'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <Icon size={16} />
                {label.split(' ')[0]}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="label">Title</label>
              <input
                className="input"
                placeholder="Announcement title..."
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea
                className="input resize-none"
                rows={5}
                placeholder="Write your message to users..."
                value={body}
                onChange={e => setBody(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Users size={14} />
                <span>All users</span>
              </div>
              <button type="submit" className="btn-primary flex items-center gap-2" disabled={sending}>
                <Send size={14} />
                {sending ? 'Sending...' : 'Send Broadcast'}
              </button>
            </div>
          </form>
        </div>

        {/* History */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-700">Broadcast History</h2>
          <div className="space-y-3">
            {mockHistory.map(h => (
              <div key={h.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className={`badge text-xs mt-0.5 ${typeColor(h.type)}`}>{h.type}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-700 truncate">{h.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{h.sent} · {h.recipients.toLocaleString()} recipients</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
