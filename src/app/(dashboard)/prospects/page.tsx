'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Prospect = {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  temperature: string | null
  first_contact_date: string | null
  last_contact_date: string | null
  preferred_typology: string | null
  notes: string | null
  assigned_to: string | null
  team_id: string | null
  created_at: string
  visited_site: boolean // Nueva columna
  has_quote: boolean    // Nueva columna
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
  const [teams, setTeams] = useState<{id: string, name: string}[]>([])
  const [advisors, setAdvisors] = useState<{id: string, full_name: string, team_id: string | null}[]>([])
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tempNote, setTempNote] = useState('')

  const supabase = createClient()

  async function loadInitialData() {
    setLoading(true)
    const { data: pData } = await supabase.from('prospects').select('*').order('created_at', { ascending: false })
    const { data: tData } = await supabase.from('teams').select('id, name')
    const { data: uData } = await supabase.from('profiles').select('id, full_name, team_id')
    
    setProspects((pData as any) ?? [])
    setTeams((tData as any) ?? [])
    setAdvisors((uData as any) ?? [])
    setLoading(false)
  }

  useEffect(() => { loadInitialData() }, [])

  async function updateProspect(id: string, updates: Partial<Prospect>) {
    // Actualización local inmediata (Optimista)
    setProspects(current => current.map(p => (p.id === id ? { ...p, ...updates } : p)));

    const { error } = await supabase
      .from('prospects')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error("Error:", error);
      loadInitialData();
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' })
  }

  return (
    <div className="relative min-h-screen bg-black text-white p-8 font-sans">
      <div className="flex justify-between items-end border-b border-white/10 pb-8 mb-8">
        <div>
          <h1 className="text-4xl font-extralight tracking-tighter uppercase italic text-white">Control Comercial</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mt-2 font-bold italic">Boralba Living</p>
        </div>
      </div>

      <input 
        type="text" 
        value={search} 
        onChange={e => setSearch(e.target.value)} 
        placeholder="BUSCAR CLIENTE..." 
        className="h-12 w-full bg-zinc-950 border border-white/10 px-4 text-[11px] uppercase tracking-widest mb-8 outline-none focus:border-purple-500 transition-all" 
      />

      <div className="border border-white/10 bg-zinc-950 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold italic">
              <th className="px-6 py-4">Asignación</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4 text-center">Visita</th>
              <th className="px-6 py-4 text-center">Cotiz.</th>
              <th className="px-6 py-4">Estatus</th>
              <th className="px-6 py-4">Últ. Gest.</th>
              <th className="px-6 py-4">Notas Rápidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {prospects
              .filter(p => p.full_name.toLowerCase().includes(search.toLowerCase()))
              .map((p) => {
                const temp = TEMP_BADGE[p.temperature ?? ''] ?? { label: '—', dot: 'bg-zinc-800', text: 'text-zinc-500' }
                
                return (
                  <tr key={p.id} className="group hover:bg-white/[0.01]">
                    {/* ASIGNACIÓN */}
                    <td className="px-6 py-5 min-w-[180px] space-y-1">
                      <select 
                        value={p.team_id || ''} 
                        onChange={(e) => updateProspect(p.id, { team_id: e.target.value })}
                        className="block w-full bg-transparent text-[9px] uppercase text-white/30 outline-none border-none focus:text-white"
                      >
                        <option value="">Equipo...</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                      <select 
                        value={p.assigned_to || ''} 
                        onChange={(e) => updateProspect(p.id, { assigned_to: e.target.value })}
                        className="block w-full bg-transparent text-[10px] uppercase text-purple-400 font-bold outline-none border-none cursor-pointer"
                      >
                        <option value="">Asesor...</option>
                        {advisors.map(u => (
                          <option key={u.id} value={u.id}>
                            {u.full_name} {u.team_id === p.team_id ? "✓" : ""}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* CLIENTE */}
                    <td className="px-6 py-5 cursor-pointer" onClick={() => setSelectedProspect(p)}>
                      <p className="text-xs uppercase tracking-wider text-white group-hover:text-purple-400 transition-colors underline decoration-white/10 underline-offset-4">
                        {p.full_name}
                      </p>
                      <p className="text-[8px] text-white/20 mt-1 uppercase italic">{p.preferred_typology || 'Sin Unidad'}</p>
                    </td>

                    {/* VISITA (Checkbox) */}
                    <td className="px-6 py-5 text-center">
                      <input 
                        type="checkbox"
                        checked={p.visited_site || false}
                        onChange={(e) => updateProspect(p.id, { visited_site: e.target.checked })}
                        className="w-3 h-3 bg-black border-white/20 rounded accent-purple-500 cursor-pointer"
                      />
                    </td>

                    {/* COTIZACIÓN (Checkbox) */}
                    <td className="px-6 py-5 text-center">
                      <input 
                        type="checkbox"
                        checked={p.has_quote || false}
                        onChange={(e) => updateProspect(p.id, { has_quote: e.target.checked })}
                        className="w-3 h-3 bg-black border-white/20 rounded accent-white cursor-pointer"
                      />
                    </td>

                    {/* ESTATUS */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${temp.dot}`} />
                        <span className={`text-[9px] uppercase font-bold ${temp.text}`}>{temp.label}</span>
                      </div>
                    </td>

                    {/* ÚLTIMA GESTIÓN */}
                    <td className="px-6 py-5 text-[10px] font-mono text-white/40 italic">
                      {formatDate(p.last_contact_date)}
                    </td>

                    {/* NOTAS */}
                    <td className="px-6 py-5 max-w-xs">
                      {editingId === p.id ? (
                        <input 
                          autoFocus 
                          value={tempNote} 
                          onChange={e => setTempNote(e.target.value)} 
                          onBlur={() => {
                            if (tempNote !== p.notes) {
                              updateProspect(p.id, { notes: tempNote, last_contact_date: new Date().toISOString() });
                            }
                            setEditingId(null);
                          }}
                          onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                          className="bg-zinc-900 border border-purple-500 px-2 py-1 text-[10px] text-white w-full outline-none" 
                        />
                      ) : (
                        <p onClick={() => { setEditingId(p.id); setTempNote(p.notes || '') }} className="text-[10px] text-white/30 italic cursor-pointer truncate hover:text-white transition-all">
                          {p.notes || "Añadir nota..."}
                        </p>
                      )}
                    </td>
                  </tr>
                )
            })}
          </tbody>
        </table>
      </div>

      {/* PANEL LATERAL (FICHA) */}
      {selectedProspect && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedProspect(null)} />
          <div className="relative w-full max-w-md bg-zinc-950 border-l border-white/10 h-full p-10 shadow-2xl overflow-y-auto">
            <button onClick={() => setSelectedProspect(null)} className="absolute top-6 right-6 text-white/20 hover:text-white text-[10px] uppercase tracking-widest border border-white/10 px-3 py-1">Cerrar ✕</button>
            <div className="space-y-10 mt-12">
              <header className="border-b border-white/5 pb-6">
                <span className="text-[8px] uppercase tracking-[0.4em] text-purple-500 font-bold italic">Detalles Prospecto</span>
                <h2 className="text-4xl font-extralight tracking-tighter uppercase italic text-white mt-2 leading-none">{selectedProspect.full_name}</h2>
              </header>
              <section className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 border ${selectedProspect.visited_site ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/5 bg-white/[0.02]'}`}>
                    <p className="text-[8px] uppercase text-white/40 mb-1">Visita Desarrollo</p>
                    <p className="text-xs uppercase font-bold">{selectedProspect.visited_site ? 'Completada' : 'Pendiente'}</p>
                  </div>
                  <div className={`p-4 border ${selectedProspect.has_quote ? 'border-white/50 bg-white/5' : 'border-white/5 bg-white/[0.02]'}`}>
                    <p className="text-[8px] uppercase text-white/40 mb-1">Cotización</p>
                    <p className="text-xs uppercase font-bold">{selectedProspect.has_quote ? 'Entregada' : 'No enviada'}</p>
                  </div>
                </div>
                {/* ... resto de la ficha ... */}
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
