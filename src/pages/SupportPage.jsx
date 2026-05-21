import { useState } from 'react'
import { MessageSquare, Clock, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Send } from 'lucide-react'

const mockTickets = [
  { id: 1, user: 'Sarah M.', email: 'sarah@example.com', subject: 'Cannot access my trips', status: 'open', priority: 'high', created: '2024-01-15', messages: [
    { from: 'user', text: 'I keep getting a blank screen when I try to open My Trips. Tried on Chrome and Safari.', time: '10:30 AM' },
    { from: 'admin', text: 'Hi Sarah, thanks for reaching out! Can you please clear your browser cache and try again?', time: '11:15 AM' },
  ]},
  { id: 2, user: 'James L.', email: 'james@example.com', subject: 'Wrong currency showing', status: 'pending', priority: 'medium', created: '2024-01-14', messages: [
    { from: 'user', text: 'Budget estimates are showing in USD but I set my region to UK.', time: '2:00 PM' },
  ]},
  { id: 3, user: 'Ana K.', email: 'ana@example.com', subject: 'Account deletion request', status: 'resolved', priority: 'low', created: '2024-01-12', messages: [
    { from: 'user', text: 'Please delete my account and all data.', time: '9:00 AM' },
    { from: 'admin', text: 'Done! Your account and data have been permanently removed.', time: '9:45 AM' },
  ]},
  { id: 4, user: 'Tom R.', email: 'tom@example.com', subject: 'Feature request: offline maps', status: 'open', priority: 'low', created: '2024-01-11', messages: [
    { from: 'user', text: 'Would love offline map support for trips without internet!', time: '4:00 PM' },
  ]},
]

const statusConfig = {
  open: { label: 'Open', color: 'bg-red-100 text-red-600', icon: AlertCircle },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-600', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-600', icon: CheckCircle },
}
const priorityColor = { high: 'text-red-500', medium: 'text-yellow-500', low: 'text-green-500' }

export default function SupportPage() {
  const [tickets, setTickets] = useState(mockTickets)
  const [selected, setSelected] = useState(null)
  const [reply, setReply] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = tickets.filter(t => filter === 'all' || t.status === filter)
  const selectedTicket = tickets.find(t => t.id === selected)

  const sendReply = () => {
    if (!reply.trim()) return
    setTickets(prev => prev.map(t => t.id === selected
      ? { ...t, messages: [...t.messages, { from: 'admin', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] }
      : t
    ))
    setReply('')
  }

  const updateStatus = (id, status) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t))
  }

  const counts = { all: tickets.length, open: tickets.filter(t => t.status === 'open').length, pending: tickets.filter(t => t.status === 'pending').length, resolved: tickets.filter(t => t.status === 'resolved').length }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Support</h1>
        <p className="text-slate-500 text-sm mt-1">Manage user support tickets</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[['All', 'all', 'bg-slate-50 text-slate-600'], ['Open', 'open', 'bg-red-50 text-red-600'], ['Pending', 'pending', 'bg-yellow-50 text-yellow-600'], ['Resolved', 'resolved', 'bg-green-50 text-green-600']].map(([label, key, color]) => (
          <button key={key} onClick={() => setFilter(key)} className={`card text-center cursor-pointer transition-all border-2 ${filter === key ? 'border-orange-400' : 'border-slate-100'}`}>
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
          {filtered.map(t => {
            const { label, color, icon: Icon } = statusConfig[t.status]
            return (
              <div
                key={t.id}
                onClick={() => setSelected(t.id === selected ? null : t.id)}
                className={`card cursor-pointer transition-all ${selected === t.id ? 'ring-2 ring-orange-400' : 'hover:border-slate-200'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge ${color} text-xs`}>
                        <Icon size={10} className="mr-1" />{label}
                      </span>
                      <span className={`text-xs font-medium ${priorityColor[t.priority]}`}>{t.priority}</span>
                    </div>
                    <div className="font-semibold text-slate-700 text-sm truncate">{t.subject}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{t.user} · {t.email}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs text-slate-400">{t.created}</span>
                    {selected === t.id ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Ticket detail */}
        {selectedTicket ? (
          <div className="card space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-800">{selectedTicket.subject}</h3>
                <p className="text-xs text-slate-400">{selectedTicket.user} · {selectedTicket.email}</p>
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

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {selectedTicket.messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${m.from === 'admin' ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-tr-sm' : 'bg-slate-100 text-slate-700 rounded-tl-sm'}`}>
                    <p>{m.text}</p>
                    <span className={`text-xs mt-1 block ${m.from === 'admin' ? 'text-orange-200' : 'text-slate-400'}`}>{m.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <input
                className="input flex-1"
                placeholder="Type a reply..."
                value={reply}
                onChange={e => setReply(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendReply()}
              />
              <button onClick={sendReply} className="btn-primary px-3">
                <Send size={14} />
              </button>
            </div>
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
