import { useState, useEffect } from 'react'
import { Megaphone, Send, Users, Bell, Mail } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const TYPES = [
  { id: 'push', label: 'Push Notification', icon: Bell, desc: 'Send to all app users' },
  { id: 'email', label: 'Email Blast', icon: Mail, desc: 'Send to all registered emails' },
  { id: 'in_app', label: 'In-App Banner', icon: Megaphone, desc: 'Display banner in the app' },
]

const typeColor = (t) =>
  t === 'push' ? 'bg-blue-100 text-blue-600'
  : t === 'email' ? 'bg-green-100 text-green-600'
  : 'bg-orange-100 text-orange-600'

export default function BroadcastPage() {
  const [type, setType] = useState('push')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [broadcasts, setBroadcasts] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  const fetchHistory = async () => {
    setLoadingHistory(true)
    const { data } = await supabase
      .from('broadcast_messages')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(20)
    setBroadcasts(data || [])
    setLoadingHistory(false)
  }

  useEffect(() => { fetchHistory() }, [])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) { toast.error('Title and message are required'); return }
    setSending(true)
    const { error } = await supabase.from('broadcast_messages').insert({
      type,
      title: title.trim(),
      body: body.trim(),
      sent_at: new Date().toISOString(),
    })
    if (error) {
      toast.error('Failed to send: ' + error.message)
    } else {
      toast.success('Broadcast sent successfully!')
      setTitle('')
      setBody('')
      fetchHistory()
    }
    setSending(false)
  }

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

          {loadingHistory ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : broadcasts.length === 0 ? (
            <div className="text-center py-10">
              <Megaphone size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium">No broadcasts sent yet.</p>
              <p className="text-slate-400 text-xs mt-1">Send your first message above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {broadcasts.map(b => (
                <div key={b.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className={`badge text-xs mt-0.5 ${typeColor(b.type)}`}>{b.type}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700 truncate">{b.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {b.sent_at ? new Date(b.sent_at).toLocaleDateString() : '—'}
                      {b.read_count != null && ` · ${b.read_count.toLocaleString()} reads`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
