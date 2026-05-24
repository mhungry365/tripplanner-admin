import { useState, useEffect } from 'react'
import { Tag, Clock, CheckCircle, XCircle, RefreshCw, ExternalLink } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const STATUS = {
  pending:  { label: 'Pending',  color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700',   icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-600',       icon: XCircle },
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function DealsPage() {
  const [deals,    setDeals]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('all')
  const [selected, setSelected] = useState(null)

  const fetchDeals = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('partner_deals')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) toast.error('Failed to load deals: ' + error.message)
    setDeals(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchDeals() }, [])

  const setStatus = async (id, status) => {
    const { error } = await supabase
      .from('partner_deals')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) { toast.error('Failed to update: ' + error.message); return }
    setDeals(prev => prev.map(d => d.id === id ? { ...d, status } : d))
    if (selected === id) setSelected(null)
    toast.success(`Deal ${status}`)
  }

  const filtered = filter === 'all' ? deals : deals.filter(d => d.status === filter)
  const selectedDeal = deals.find(d => d.id === selected)

  const counts = {
    all:      deals.length,
    pending:  deals.filter(d => d.status === 'pending').length,
    approved: deals.filter(d => d.status === 'approved').length,
    rejected: deals.filter(d => d.status === 'rejected').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Partner Deals</h1>
          <p className="text-slate-500 text-sm mt-1">Review and approve deal submissions from partners</p>
        </div>
        <button onClick={fetchDeals} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors" title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[['All', 'all', 'bg-slate-50 text-slate-600'], ['Pending', 'pending', 'bg-yellow-50 text-yellow-600'], ['Approved', 'approved', 'bg-green-50 text-green-600'], ['Rejected', 'rejected', 'bg-red-50 text-red-600']].map(([label, key, color]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`card text-center cursor-pointer transition-all border-2 ${filter === key ? 'border-orange-400' : 'border-slate-100'}`}>
            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${color} mb-2 mx-auto`}>
              <Tag size={14} />
            </div>
            <div className="text-xl font-bold text-slate-800">{counts[key]}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Deal list */}
        <div className="space-y-3">
          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="card h-20 animate-pulse bg-slate-50" />)
          ) : filtered.length === 0 ? (
            <div className="card text-center py-12">
              <Tag size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium">No deals found</p>
              <p className="text-slate-400 text-xs mt-1">Partner deal submissions will appear here</p>
            </div>
          ) : (
            filtered.map(d => {
              const cfg = STATUS[d.status] || STATUS.pending
              const Icon = cfg.icon
              return (
                <div key={d.id}
                  onClick={() => setSelected(d.id === selected ? null : d.id)}
                  className={`card cursor-pointer transition-all ${selected === d.id ? 'ring-2 ring-orange-400' : 'hover:border-slate-200'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`badge ${cfg.color} text-xs flex items-center gap-1`}>
                          <Icon size={10} /> {cfg.label}
                        </span>
                        {d.discount_percentage && (
                          <span className="text-xs font-semibold text-indigo-600">{d.discount_percentage}% off</span>
                        )}
                      </div>
                      <div className="font-semibold text-slate-700 text-sm truncate">{d.business_name}</div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate">{d.contact_email}</div>
                    </div>
                    <div className="text-xs text-slate-400 flex-shrink-0">{timeAgo(d.created_at)}</div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Deal detail */}
        {selectedDeal ? (
          <div className="card space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-bold text-slate-800 truncate">{selectedDeal.business_name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedDeal.contact_email}</p>
              </div>
              <span className={`badge ${(STATUS[selectedDeal.status] || STATUS.pending).color} text-xs flex-shrink-0`}>
                {(STATUS[selectedDeal.status] || STATUS.pending).label}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-slate-500 mb-1">Deal description</p>
                <p className="text-slate-700 leading-relaxed">{selectedDeal.deal_description}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {selectedDeal.discount_percentage && (
                  <div className="bg-indigo-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-slate-500 mb-0.5">Discount</p>
                    <p className="font-bold text-indigo-700">{selectedDeal.discount_percentage}%</p>
                  </div>
                )}
                {selectedDeal.valid_until && (
                  <div className="bg-amber-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-slate-500 mb-0.5">Valid until</p>
                    <p className="font-bold text-amber-700">{new Date(selectedDeal.valid_until).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
              {selectedDeal.website && (
                <a href={selectedDeal.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-700 font-semibold transition-colors">
                  <ExternalLink size={12} /> {selectedDeal.website}
                </a>
              )}
              <p className="text-xs text-slate-400">Submitted {timeAgo(selectedDeal.created_at)}</p>
            </div>

            {selectedDeal.status === 'pending' && (
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setStatus(selectedDeal.id, 'approved')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors">
                  <CheckCircle size={14} /> Approve
                </button>
                <button
                  onClick={() => setStatus(selectedDeal.id, 'rejected')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">
                  <XCircle size={14} /> Reject
                </button>
              </div>
            )}
            {selectedDeal.status !== 'pending' && (
              <button
                onClick={() => setStatus(selectedDeal.id, 'pending')}
                className="w-full py-2 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50 transition-colors font-medium">
                Reset to Pending
              </button>
            )}
          </div>
        ) : (
          <div className="card flex items-center justify-center text-slate-400 min-h-48">
            <div className="text-center">
              <Tag size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Select a deal to review</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
