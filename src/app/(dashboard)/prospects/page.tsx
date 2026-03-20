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
  notes: string | null // Nueva columna
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
  const [tempFilter, setTempFilter] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tempNote, setTempNote] = useState('')

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
    if (tempFilter) result = result.filter(p => p.temperature === tempFilter)
    setFiltered(result)
  }, [search, tempFilter, prospects])

  async function saveQuickNote(id: string) {
    await supabase.from('prospects').update({ 
      notes: tempNote,
      last_contact_date: new Date().toISOString() 
    }).eq('id', id)
    setEditingId(null)
    loadProspects()
  }

  return (
    <div className="space-y-8 bg-black text-white min-h-screen">
      <div className="border-b border-white/10 pb-8">
        <h1 className="text-4xl font-extralight tracking-tighter uppercase">Prospectos</h1>
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mt-2">Control de Inventario y Seguimiento</p>
      </div>

      {/* Buscador */}
      <div className="flex bg-white/10 border border-white/10">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="BUSCAR POR NOMBRE, NOTA O TIPOLOGÍA..." className="h-12 flex-1 bg-zinc-950 px-4 text-[11px] uppercase tracking-widest text-white focus:outline-none" />
      </div>

      <div className="border border-white/10 bg-zinc-950 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="px-6 py-4 text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">Registro</th>
              <th className="px-6 py-4 text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">Cliente</th>
              <th className="px-6 py-4 text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">Interés</th>
              <th className="px-6 py-4 text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">Estatus</th>
              <th className="px-6 py-4 text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">Situación Actual (Notas)</th>
              <th className="px-6 py-4 text-right text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((p) => {
              const temp = TEMP_BADGE[p.temperature ?? ''] ?? { label: '—', dot: 'bg-zinc-800', text: 'text-zinc-500' }
              return (
                <tr key={p.id} className="group hover:bg-white/[0.01] transition-all">
                  <td className="px-6 py-5 text-[10px] font-mono text-purple-400">
                    {new Date(p.created_at).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs uppercase tracking-wider font-light text-white">{p.full_name}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] text-white/40 border border-white/10 px-2 py-0.5 rounded-sm">
                      {p.preferred_typology || 'Sin asignar'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${temp.dot}`} />
                      <span className={`text-[9px] uppercase tracking-[0.15em] font-bold ${temp.text}`}>{temp.label}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 max-w-xs">
                    {editingId === p.id ? (
                      <input autoFocus value={tempNote} onChange={e => setTempNote(e.target.value)} onBlur={() => saveQuickNote(p.id)} onKeyDown={e => e.key === 'Enter' && saveQuickNote(p.id)} className="bg-black border border-purple-500/50 px-2 py-1 text-[10px] text-white w-full outline-none" />
                    ) : (
                      <p onClick={() => { setEditingId(p.id); setTempNote(p.notes || '') }} className="text-[10px] text-white/40 italic cursor-pointer hover:text-white line-clamp-1 border-b border-transparent hover:border-white/10">
                        {p.notes || "Añadir comentario de seguimiento..."}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right font-bold">
                    <Link href={`/prospects/${p.id}`} className="text-[9px] uppercase tracking-[0.2em] text-white/20 group-hover:text-purple-400 transition-colors">Perfil →</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
