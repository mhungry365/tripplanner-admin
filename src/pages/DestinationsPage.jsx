import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Search, Pencil, Trash2, X, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = {
  city: '',
  country_name: '',
  country_code: '',
  continent: '',
  description: '',
  cover_image_url: '',
  avg_daily_budget_usd: '',
  safety_rating: 3,
  popularity_score: 50,
  currency_code: '',
  currency_symbol: '',
  timezone: '',
  flag_emoji: '',
}

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('destinations')
      .select('id,city,country_name,continent,flag_emoji,cover_image_url,avg_daily_budget_usd,safety_rating,popularity_score')
      .order('city')
      .limit(100)
    setDestinations(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const openCreate = () => { setForm(EMPTY); setModal('create') }
  const openEdit = (d) => { setForm({ ...EMPTY, ...d }); setModal('edit') }
  const closeModal = () => { setModal(null); setForm(EMPTY) }

  const f = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))
  const fNum = (key) => (e) => setForm(prev => ({ ...prev, [key]: Number(e.target.value) }))

  const handleSave = async () => {
    if (!form.city || !form.country_name) { toast.error('City and country name are required'); return }
    setSaving(true)

    const payload = {
      city: form.city,
      country_name: form.country_name,
      country_code: form.country_code || null,
      continent: form.continent || null,
      description: form.description || null,
      cover_image_url: form.cover_image_url || null,
      avg_daily_budget_usd: form.avg_daily_budget_usd ? Number(form.avg_daily_budget_usd) : null,
      safety_rating: form.safety_rating ? Number(form.safety_rating) : null,
      popularity_score: form.popularity_score ? Number(form.popularity_score) : null,
      currency_code: form.currency_code || null,
      currency_symbol: form.currency_symbol || null,
      timezone: form.timezone || null,
      flag_emoji: form.flag_emoji || null,
    }

    if (modal === 'create') {
      const { error } = await supabase.from('destinations').insert(payload)
      if (error) toast.error(error.message)
      else { toast.success('Destination created'); closeModal(); fetchData() }
    } else {
      const { error } = await supabase.from('destinations').update(payload).eq('id', form.id)
      if (error) toast.error(error.message)
      else { toast.success('Destination updated'); closeModal(); fetchData() }
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this destination?')) return
    const { error } = await supabase.from('destinations').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Deleted'); setDestinations(prev => prev.filter(d => d.id !== id)) }
  }

  const filtered = destinations.filter(d =>
    !search ||
    d.city?.toLowerCase().includes(search.toLowerCase()) ||
    d.country_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Destinations</h1>
          <p className="text-slate-500 text-sm mt-1">{destinations.length} destinations</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Destination
          </button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input pl-9" placeholder="Search by city or country..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-th">City</th>
              <th className="table-th">Country</th>
              <th className="table-th">Continent</th>
              <th className="table-th">Avg Budget/day</th>
              <th className="table-th">Popularity</th>
              <th className="table-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="table-td"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>)}</tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="table-td text-center text-slate-400 py-10">No destinations found.</td></tr>
            ) : (
              filtered.map(d => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      {d.cover_image_url && <img src={d.cover_image_url} alt="" className="w-10 h-8 rounded-lg object-cover flex-shrink-0" />}
                      <span className="font-medium text-slate-700">
                        {d.flag_emoji && <span className="mr-1">{d.flag_emoji}</span>}
                        {d.city}
                      </span>
                    </div>
                  </td>
                  <td className="table-td text-slate-500">{d.country_name}</td>
                  <td className="table-td text-slate-500">{d.continent || '—'}</td>
                  <td className="table-td text-slate-500">
                    {d.avg_daily_budget_usd ? `$${d.avg_daily_budget_usd}` : '—'}
                  </td>
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${d.popularity_score || 0}%` }} />
                      </div>
                      <span className="text-xs text-slate-400">{d.popularity_score || 0}</span>
                    </div>
                  </td>
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(d)} className="text-slate-400 hover:text-orange-500 p-1 rounded hover:bg-orange-50 transition-all">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(d.id)} className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">{modal === 'create' ? 'Add Destination' : 'Edit Destination'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">City *</label>
                  <input className="input" value={form.city} onChange={f('city')} placeholder="e.g. Tokyo" />
                </div>
                <div>
                  <label className="label">Country Name *</label>
                  <input className="input" value={form.country_name} onChange={f('country_name')} placeholder="e.g. Japan" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Country Code</label>
                  <input className="input" value={form.country_code || ''} onChange={f('country_code')} placeholder="e.g. JP" maxLength={2} />
                </div>
                <div>
                  <label className="label">Flag Emoji</label>
                  <input className="input" value={form.flag_emoji || ''} onChange={f('flag_emoji')} placeholder="e.g. 🇯🇵" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Continent</label>
                  <select className="input" value={form.continent || ''} onChange={f('continent')}>
                    <option value="">Select...</option>
                    {['Asia','Europe','Americas','Africa','Oceania','Middle East'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Timezone</label>
                  <input className="input" value={form.timezone || ''} onChange={f('timezone')} placeholder="e.g. Asia/Tokyo" />
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input resize-none" rows={3} value={form.description || ''} onChange={f('description')} />
              </div>
              <div>
                <label className="label">Cover Image URL</label>
                <input className="input" value={form.cover_image_url || ''} onChange={f('cover_image_url')} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Currency Code</label>
                  <input className="input" value={form.currency_code || ''} onChange={f('currency_code')} placeholder="e.g. JPY" maxLength={3} />
                </div>
                <div>
                  <label className="label">Currency Symbol</label>
                  <input className="input" value={form.currency_symbol || ''} onChange={f('currency_symbol')} placeholder="e.g. ¥" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Avg Budget/day (USD)</label>
                  <input type="number" min={0} className="input" value={form.avg_daily_budget_usd || ''} onChange={fNum('avg_daily_budget_usd')} placeholder="150" />
                </div>
                <div>
                  <label className="label">Safety (1-5)</label>
                  <input type="number" min={1} max={5} className="input" value={form.safety_rating || ''} onChange={fNum('safety_rating')} />
                </div>
                <div>
                  <label className="label">Popularity (0-100)</label>
                  <input type="number" min={0} max={100} className="input" value={form.popularity_score || ''} onChange={fNum('popularity_score')} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={closeModal} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : modal === 'create' ? 'Create' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
