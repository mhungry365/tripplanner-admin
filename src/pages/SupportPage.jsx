import { useState, useEffect } from 'react'
import { MessageSquare, Clock, CheckCircle, AlertCircle, Send, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const statusConfig = {
  open:     { label: 'Open',     color: 'bg-red-100 text-red-600',    icon: AlertCircle },
  pending:  { label: 'Pending',  color: 'bg-yellow-100 text-yellow-600', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-600', icon: CheckCircle },
}

const priorityColor = { high: 'text-red-500', medium: 'text-yellow-500', normal: 'text-slate-400', low: 'text-green-500' }

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function SupportPage() {
  const [tickets, setTickets]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)
  const [reply, setReply]       = useState('')
  const [sending, setSending]   = useState(false)
  const [filter, setFilter]     = useState('all')

  const fetchTickets = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*, profiles(full_name, email, avatar_url)')
      .order('created_at', { ascending: false })
    if (error) toast.error('Failed to load tickets: ' + error.message)
    setTickets(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchTickets() }, [])

  const filtered = tickets.filter(t => filter === 'all' || t.status === filter)
  const selectedTicket = tickets.find(t => t.id === selected)

  const counts = {
    all:      tickets.length,
    open:     tickets.filter(t => t.status === 'open').length,
    pending:  tickets.filter(t => t.status === 'pending').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  }

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from('support_tickets')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) { toast.error('Failed to update status'); return }
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t))
  }

  const sendReply = async () => {
    if (!reply.trim() || !selectedTicket) return
    setSending(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('support_tickets')
      .update({
        admin_response: reply.trim(),
        responded_by:   user.id,
        responded_at:   new Date().toISOString(),
        status:         'resolved',
        updated_at:     new Date().toISOString(),
      })
      .eq('id', selectedTicket.id)
    if (error) {
      toast.error('Failed to send reply: ' + error.message)
    } else {
      toast.success('Reply sent and ticket resolved')
      setTickets(prev => prev.map(t => t.id === selectedTicket.id
        ? { ...t, admin_response: reply.trim(), responded_at: new Date().toISOString(), status: 'resolved' }
        : t
      ))
      setReply('')
    }
    setSending(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Support</h1>
          <p className="text-slate-500 text-sm mt-1">Manage user support tickets</p>
        </div>
        <button onClick={fetchTickets} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors" title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[['All', 'all', 'bg-slate-50 text-slate-600'], ['Open', 'open', 'bg-red-50 text-red-600'], ['Pending', 'pending', 'bg-yellow-50 text-yellow-600'], ['Resolved', 'resolved', 'bg-green-50 text-green-600']].map(([label, key, color]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`card text-center cursor-pointer transition-all border-2 ${filter === key ? 'border-orange-400' : 'border-slate-100'}`}>
            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${color} mb-2 mx-auto`}>
              <MessageSquare size={14} />
            </div>
            <div className="text-xl font-bold text-slate-800">{counts[key]}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Ticket list */}
        <div className="space-y-3">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="card h-20 animate-pulse bg-slate-50" />
            ))
          ) : filtered.length === 0 ? (
            <div className="card text-center py-12">
              <MessageSquare size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium">No support tickets yet.</p>
              <p className="text-slate-400 text-xs mt-1">When users submit help requests they will appear here.</p>
            </div>
          ) : (
            filtered.map(t => {
              const cfg = statusConfig[t.status] || statusConfig.open
              const Icon = cfg.icon
              const userName = t.profiles?.full_name || 'Unknown User'
              const userEmail = t.profiles?.email || ''
              return (
                <div
                  key={t.id}
                  onClick={() => setSelected(t.id === selected ? null : t.id)}
                  className={`card cursor-pointer transition-all ${selected === t.id ? 'ring-2 ring-orange-400' : 'hover:border-slate-200'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`badge ${cfg.color} text-xs flex items-center gap-1`}>
                          <Icon size={10} />{cfg.label}
                        </span>
                        <span className={`text-xs font-medium ${priorityColor[t.priority] || priorityColor.normal}`}>
                          {t.priority}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-700 text-sm truncate">{t.subject}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{userName} · {userEmail}</div>
                    </div>
                    <div className="text-xs text-slate-400 flex-shrink-0">{timeAgo(t.created_at)}</div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Ticket detail */}
        {selectedTicket ? (
          <div className="card space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-800">{selectedTicket.subject}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedTicket.profiles?.full_name || 'Unknown'} · {selectedTicket.profiles?.email || ''}
                </p>
                <p className="text-[10px] text-slate-300 mt-0.5">{timeAgo(selectedTicket.created_at)}</p>
              </div>
              <select
                value={selectedTicket.status}
                onChange={e => updateStatus(selectedTicket.id, e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* User message */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              <div className="flex justify-start">
                <div className="max-w-xs px-3 py-2 rounded-2xl rounded-tl-sm bg-slate-100 text-slate-700 text-sm">
                  <p>{selectedTicket.message}</p>
                  <span className="text-xs text-slate-400 mt-1 block">{timeAgo(selectedTicket.created_at)}</span>
                </div>
              </div>

              {selectedTicket.admin_response && (
                <div className="flex justify-end">
                  <div className="max-w-xs px-3 py-2 rounded-2xl rounded-tr-sm bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm">
                    <p>{selectedTicket.admin_response}</p>
                    <span className="text-xs text-orange-200 mt-1 block">{timeAgo(selectedTicket.responded_at)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Reply form */}
            {!selectedTicket.admin_response ? (
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <input
                  className="input flex-1"
                  placeholder="Type a reply..."
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
                />
                <button onClick={sendReply} disabled={sending || !reply.trim()} className="btn-primary px-3 disabled:opacity-50">
                  <Send size={14} />
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center pt-2 border-t border-slate-100">
                Replied {timeAgo(selectedTicket.responded_at)} · ticket resolved
              </p>
            )}
          </div>
        ) : (
          <div className="card flex items-center justify-center text-slate-400 min-h-48">
            <div className="text-center">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Select a ticket to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
