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

  // ACTUALIZACIÓN CORREGIDA: Mantiene la fila en su lugar exacto
  async function updateProspect(id: string, updates: Partial<Prospect>) {
    // Actualización local inmediata (Optimista)
    setProspects(currentProspects => {
      return currentProspects.map(p => (p.id === id ? { ...p, ...updates } : p));
    });

    const { error } = await supabase
      .from('prospects')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error("Error:", error);
      loadInitialData(); // Solo recarga si falla
    }
    // IMPORTANTE: No llamamos a loadInitialData() para que el array no se re-ordene por 'updated_at'
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' })
  }

  return (
    <div className="relative min-h-screen bg-black text-white p-8">
      <div className="flex justify-between items-end border-b border-white/10 pb-8 mb-8">
        <div>
          <h1 className="text-4xl font-extralight tracking-tighter uppercase italic text-white">Directorio de Prospectos</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mt-2 font-bold italic">Boralba Living x Blancarte Arquitectura</p>
        </div>
      </div>

      <input 
        type="text" 
        value={search} 
        onChange={e => setSearch(e.target.value)} 
        placeholder="FILTRAR POR NOMBRE..." 
        className="h-12 w-full bg-zinc-950 border border-white/10 px-4 text-[11px] uppercase tracking-widest mb-8 outline-none focus:border-purple-500 transition-all" 
      />

      <div className="border border-white/10 bg-zinc-950 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold italic">
              <th className="px-6 py-4">Equipo</th>
              <th className="px-6 py-4">Asesor Asignado</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Estatus</th>
              <th className="px-6 py-4">Seguimiento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {prospects
              .filter(p => p.full_name.toLowerCase().includes(search.toLowerCase()))
              .map((p) => {
                const temp = TEMP_BADGE[p.temperature ?? ''] ?? { label: '—', dot: 'bg-zinc-800', text: 'text-zinc-500' }
                
                return (
                  <tr key={p.id} className="group hover:bg-white/[0.01]">
                    {/* SELECTOR DE EQUIPO (Independiente) */}
                    <td className="px-6 py-5">
                      <select 
                        value={p.team_id || ''} 
                        onChange={(e) => updateProspect(p.id, { team_id: e.target.value })}
                        className="bg-transparent text-[10px] uppercase text-white/40 outline-none border-none focus:text-white cursor-pointer"
                      >
                        <option value="">Sin Equipo</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </td>

                    {/* SELECTOR DE ASESOR (Independiente pero resaltado) */}
                    <td className="px-6 py-5">
                      <select 
                        value={p.assigned_to || ''} 
                        onChange={(e) => updateProspect(p.id, { assigned_to: e.target.value })}
                        className="bg-transparent text-[11px] uppercase text-purple-400 font-bold outline-none border-none cursor-pointer"
                      >
                        <option value="">Seleccionar Asesor...</option>
                        {advisors.map(u => (
                          <option key={u.id} value={u.id} className={u.team_id === p.team_id ? "font-bold text-white" : "text-zinc-600"}>
                            {u.full_name} {u.team_id === p.team_id ? "✓" : ""}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-6 py-5 cursor-pointer" onClick={() => setSelectedProspect(p)}>
                      <p className="text-xs uppercase tracking-wider text-white group-hover:text-purple-400 transition-colors">
                        {p.full_name}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className={`h-1 w-1 rounded-full ${temp.dot}`} />
                        <span className={`text-[9px] uppercase font-bold ${temp.text}`}>{temp.label}</span>
                      </div>
                    </td>

                    <td className="px-6 py-5 max-w-xs">
                      {editingId === p.id ? (
                        <input 
                          autoFocus 
                          value={tempNote} 
                          onChange={e => setTempNote(e.target.value)} 
                          onBlur={() => {
                            updateProspect(p.id, { notes: tempNote, last_contact_date: new Date().toISOString() });
                            setEditingId(null);
                          }}
                          onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                          className="bg-zinc-900 border border-purple-500 px-2 py-1 text-[10px] text-white w-full outline-none" 
                        />
                      ) : (
                        <p onClick={() => { setEditingId(p.id); setTempNote(p.notes || '') }} className="text-[10px] text-white/30 italic cursor-pointer truncate hover:text-white transition-colors">
                          {p.notes || "Click para añadir nota..."}
                        </p>
                      )}
                    </td>
                  </tr>
                )
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL LATERAL - FICHA */}
      {selectedProspect && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedProspect(null)} />
          <div className="relative w-full max-w-md bg-zinc-950 border-l border-white/10 h-full p-10 shadow-2xl overflow-y-auto">
            <header className="border-b border-white/5 pb-6 mb-8 flex justify-between items-start">
              <div>
                <span className="text-[8px] uppercase tracking-[0.3em] text-purple-500 font-bold">Ficha Técnica</span>
                <h2 className="text-3xl font-extralight tracking-tighter uppercase italic text-white mt-1">{selectedProspect.full_name}</h2>
              </div>
              <button onClick={() => setSelectedProspect(null)} className="text-white/20 hover:text-white text-xs border border-white/10 px-2 py-1">Cerrar</button>
            </header>

            <div className="space-y-6">
               <div className="bg-white/[0.02] border border-white/5 p-4">
                  <p className="text-[8px] text-white/30 uppercase mb-1 tracking-widest">Contacto Directo</p>
                  <p className="text-sm font-mono text-white select-all">{selectedProspect.phone || '—'}</p>
                  <p className="text-[10px] text-white/50 mt-2 lowercase">{selectedProspect.email || '—'}</p>
               </div>
               <div className="bg-black border border-white/5 p-4">
                  <p className="text-[8px] text-white/30 uppercase mb-2">Historial de Notas</p>
                  <p className="text-[11px] leading-relaxed text-white/60 italic">{selectedProspect.notes || 'Sin bitácora.'}</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
