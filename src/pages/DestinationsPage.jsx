import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Search, Pencil, Trash2, X, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = { name: '', country: '', continent: '', description: '', image_url: '', budget_level: 'medium', safety_rating: 3, popularity_score: 50 }

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // null | 'create' | 'edit'
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const fetch = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('destinations')
      .select('id,name,country,continent,description,image_url,budget_level,safety_rating,popularity_score')
      .order('name')
      .limit(100)
    setDestinations(data || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const openCreate = () => { setForm(EMPTY); setModal('create') }
  const openEdit = (d) => { setForm({ ...d }); setModal('edit') }
  const closeModal = () => { setModal(null); setForm(EMPTY) }

  const handleSave = async () => {
    if (!form.name || !form.country) { toast.error('Name and country are required'); return }
    setSaving(true)
    if (modal === 'create') {
      const { error } = await supabase.from('destinations').insert({ ...form })
      if (error) toast.error(error.message)
      else { toast.success('Destination created'); closeModal(); fetch() }
    } else {
      const { error } = await supabase.from('destinations').update({ ...form }).eq('id', form.id)
      if (error) toast.error(error.message)
      else { toast.success('Destination updated'); closeModal(); fetch() }
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
    !search || d.name?.toLowerCase().includes(search.toLowerCase()) || d.country?.toLowerCase().includes(search.toLowerCase())
  )

  const budgetColor = (b) => b === 'budget' ? 'bg-green-100 text-green-600' : b === 'luxury' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Destinations</h1>
          <p className="text-slate-500 text-sm mt-1">{destinations.length} destinations</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetch} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Destination
          </button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input pl-9" placeholder="Search destinations..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-th">Destination</th>
              <th className="table-th">Country</th>
              <th className="table-th">Continent</th>
              <th className="table-th">Budget</th>
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
                      {d.image_url && <img src={d.image_url} alt="" className="w-10 h-8 rounded-lg object-cover flex-shrink-0" />}
                      <span className="font-medium text-slate-700">{d.name}</span>
                    </div>
                  </td>
                  <td className="table-td text-slate-500">{d.country}</td>
                  <td className="table-td text-slate-500">{d.continent || '—'}</td>
                  <td className="table-td"><span className={`badge ${budgetColor(d.budget_level)}`}>{d.budget_level}</span></td>
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
                  <label className="label">Name *</label>
                  <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Country *</label>
                  <input className="input" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Continent</label>
                <input className="input" value={form.continent || ''} onChange={e => setForm(f => ({ ...f, continent: e.target.value }))} />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input resize-none" rows={3} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="label">Image URL</label>
                <input className="input" value={form.image_url || ''} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Budget Level</label>
                  <select className="input" value={form.budget_level || 'medium'} onChange={e => setForm(f => ({ ...f, budget_level: e.target.value }))}>
                    <option value="budget">Budget</option>
                    <option value="medium">Medium</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>
                <div>
                  <label className="label">Safety (1-5)</label>
                  <input type="number" min={1} max={5} className="input" value={form.safety_rating || 3} onChange={e => setForm(f => ({ ...f, safety_rating: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="label">Popularity (0-100)</label>
                  <input type="number" min={0} max={100} className="input" value={form.popularity_score || 0} onChange={e => setForm(f => ({ ...f, popularity_score: Number(e.target.value) }))} />
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
