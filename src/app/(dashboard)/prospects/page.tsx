'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type Prospect = {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  temperature: string | null
  created_at: string
  first_contact_date: string | null
  last_contact_date: string | null
  preferred_typology: string | null
  notes: string | null
}

const TEMP_BADGE: Record<string, { label: string; dot: string; text: string }> = {
  cold:    { label: 'Frío',     dot: 'bg-zinc-500',   text: 'text-zinc-400' },
  warm:    { label: 'Tibio',    dot: 'bg-orange-500', text: 'text-orange-400' },
  hot:     { label: 'Caliente', dot: 'bg-purple-500', text: 'text-purple-400' },
  medium:  { label: 'Medio',    dot: 'bg-yellow-500', text: 'text-yellow-400' },
  closing: { label: 'Cierre',   dot: 'bg-white',      text: 'text-white' },
}

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [filtered, setFiltered] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  // Edición Rápida
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tempNote, setTempNote] = useState('')

  // Formulario Nuevo Prospecto
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [temperature, setTemperature] = useState('medium')
  const [typology, setTypology] = useState('')
  const [notes, setNotes] = useState('')
  const [firstContact, setFirstContact] = useState(new Date().toISOString().split('T')[0])

  const supabase = createClient()

  async function loadProspects() {
    setLoading(true)
    const { data, error } = await supabase
      .from('prospects')
      .select('id, full_name, phone, email, temperature, created_at, first_contact_date, last_contact_date, preferred_typology, notes')
      .order('created_at', { ascending: false })
    
    if (!error) {
      setProspects((data as any) ?? [])
      setFiltered((data as any) ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { loadProspects() }, [])

  useEffect(() => {
    let result = prospects
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.full_name?.toLowerCase().includes(q) ||
        p.notes?.toLowerCase().includes(q) ||
        p.preferred_typology?.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [search, prospects])

  async function saveQuickNote(id: string) {
    const now = new Date().toISOString()
    await supabase.from('prospects').update({ 
      notes: tempNote,
      last_contact_date: now 
    }).eq('id', id)
    setEditingId(null)
    loadProspects()
  }

  async function saveProspect() {
    if (!fullName.trim()) return
    setSaving(true)
    await supabase.from('prospects').insert({
      full_name: fullName,
      phone: phone || null,
      email: email || null,
      temperature,
      preferred_typology: typology || null,
      notes: notes || null,
      first_contact_date: firstContact,
    })
    setSaving(false)
    setShowModal(false)
    loadProspects()
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="space-y-8 bg-black text-white min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-8">
        <div>
          <h1 className="text-4xl font-extralight tracking-tighter uppercase italic">Directorio</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mt-2 font-bold italic">Boralba Living CRM</p>
        </div>
        <button onClick={() => setShowModal(true)} className="h-10 border border-white/20 bg-white text-black px-6 text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-200 transition-all">
          + Nuevo Registro Comercial
        </button>
      </div>

      <div className="flex bg-white/10 border border-white/10">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="FILTRAR POR CLIENTE, NOTA O UNIDAD..." className="h-12 flex-1 bg-zinc-950 px-4 text-[11px] uppercase tracking-widest text-white focus:outline-none" />
      </div>

      <div className="border border-white/10 bg-zinc-950 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="px-6 py-4 text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold italic">1er Contacto</th>
              <th className="px-6 py-4 text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold italic">Últ. Gestión</th>
              <th className="px-6 py-4 text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold italic">Nombre del Cliente</th>
              <th className="px-6 py-4 text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold italic">Unidad / Interés</th>
              <th className="px-6 py-4 text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold italic">Bitácora de Situación</th>
              <th className="px-6 py-4 text-right text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold italic">Ficha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((p) => {
              const temp = TEMP_BADGE[p.temperature ?? ''] ?? { label: '—', dot: 'bg-zinc-800', text: 'text-zinc-500' }
              return (
                <tr key={p.id} className="group hover:bg-white/[0.01] transition-all">
                  <td className="px-6 py-5 text-[10px] font-mono text-purple-400 font-bold">{formatDate(p.first_contact_date)}</td>
                  <td className="px-6 py-5 text-[10px] font-mono text-white/40">{formatDate(p.last_contact_date)}</td>
                  <td className="px-6 py-5">
                    <p className="text-xs uppercase tracking-wider font-light text-white">{p.full_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`h-1 w-1 rounded-full ${temp.dot}`} />
                      <span className={`text-[8px] uppercase font-bold ${temp.text}`}>{temp.label}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[9px] text-white/30 border border-white/5 px-2 py-0.5 bg-white/[0.02] italic">{p.preferred_typology || 'PENDIENTE'}</span>
                  </td>
                  <td className="px-6 py-5 max-w-sm">
                    {editingId === p.id ? (
                      <input autoFocus value={tempNote} onChange={e => setTempNote(e.target.value)} onBlur={() => saveQuickNote(p.id)} onKeyDown={e => e.key === 'Enter' && saveQuickNote(p.id)} className="bg-black border border-purple-500/50 px-2 py-1 text-[10px] text-white w-full outline-none" />
                    ) : (
                      <p onClick={() => { setEditingId(p.id); setTempNote(p.notes || '') }} className="text-[10px] text-white/40 italic cursor-pointer hover:text-white line-clamp-2">
                        {p.notes || "Click para añadir nota..."}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right font-bold tracking-tighter underline text-white/10 group-hover:text-purple-400 transition-all italic text-[10px]">
                    <Link href={`/prospects/${p.id}`}>VER +</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Reestilizado con Fecha Editable */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 text-white">
          <div className="w-full max-w-lg border border-white/10 bg-zinc-950 p-8 space-y-6 shadow-2xl">
            <h2 className="text-xl font-extralight uppercase tracking-widest border-b border-white/5 pb-4 italic">Alta de Prospecto Comercial</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold">Fecha Primer Contacto</label>
                  <input type="date" value={firstContact} onChange={e => setFirstContact(e.target.value)}
                    className="mt-2 w-full border-b border-white/10 bg-transparent py-2 text-sm text-purple-400 focus:outline-none focus:border-white font-mono" />
                </div>
                <div>
                  <label className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold">Temperatura</label>
                  <select value={temperature} onChange={e => setTemperature(e.target.value)}
                    className="mt-2 w-full border-b border-white/10 bg-transparent py-2 text-sm text-white focus:outline-none">
                    <option value="cold">Frío</option><option value="warm">Tibio</option><option value="medium">Medio</option><option value="hot">Caliente</option><option value="closing">Cierre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold">Nombre Completo del Cliente</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)}
                  className="mt-2 w-full border-b border-white/10 bg-transparent py-2 text-sm text-white focus:outline-none focus:border-white transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold">Teléfono / Celular</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)}
                    className="mt-2 w-full border-b border-white/10 bg-transparent py-2 text-sm text-white focus:outline-none focus:border-white" />
                </div>
                <div>
                  <label className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold">Tipología / Unidad</label>
                  <input value={typology} onChange={e => setTypology(e.target.value)} placeholder="Ej: Jacaranda"
                    className="mt-2 w-full border-b border-white/10 bg-transparent py-2 text-sm text-white focus:outline-none focus:border-white" />
                </div>
              </div>

              <div>
                <label className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold">Situación Inicial / Notas</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                  className="mt-2 w-full border border-white/10 bg-black p-3 text-sm text-white focus:outline-none focus:border-white/30 resize-none italic"
                  placeholder="Anotar comentarios de la primera gestión..." />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-[10px] uppercase tracking-widest text-white/30 hover:text-white transition-all font-bold italic">Descartar</button>
              <button onClick={saveProspect} disabled={saving}
                className="flex-1 py-3 bg-white text-black text-[10px] uppercase tracking-widest font-bold hover:bg-purple-600 hover:text-white disabled:opacity-50 transition-all italic">
                {saving ? 'Procesando...' : 'Confirmar Registro'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
