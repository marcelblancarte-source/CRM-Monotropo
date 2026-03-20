'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Prospect = {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  temperature: string | null
  last_contact_date: string | null
  next_contact_date: string | null 
  notes: string | null
  assigned_to: string | null
  team_id: string | null
  visited_site: boolean
  has_quote: boolean
  created_at: string
  preferred_typology: string | null
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
  const [filterType, setFilterType] = useState<'all' | 'urgent' | 'today'>('all')

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

  async function createProspect() {
    const newName = prompt("Nombre completo del prospecto:");
    if (!newName) return;
    const { data, error } = await supabase.from('prospects').insert([{ full_name: newName, temperature: 'cold' }]).select().single();
    if (error) alert("Error al crear");
    else loadInitialData();
  }

  async function updateProspect(id: string, updates: Partial<Prospect>) {
    setProspects(current => current.map(p => (p.id === id ? { ...p, ...updates } : p)));
    if (selectedProspect?.id === id) {
      setSelectedProspect(prev => prev ? { ...prev, ...updates } : null);
    }
    await supabase.from('prospects').update(updates).eq('id', id);
  }

  const getAlertStatus = (dateStr: string | null) => {
    if (!dateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    if (target < today) return 'vencido';
    if (target.getTime() === today.getTime()) return 'hoy';
    return 'futuro';
  };

  const filteredProspects = prospects.filter(p => {
    const matchesSearch = p.full_name.toLowerCase().includes(search.toLowerCase());
    const alert = getAlertStatus(p.next_contact_date);
    if (filterType === 'urgent') return matchesSearch && alert === 'vencido';
    if (filterType === 'today') return matchesSearch && alert === 'hoy';
    return matchesSearch;
  });

  return (
    <div className="relative min-h-screen bg-black text-white p-8 font-sans">
      {/* HEADER DINÁMICO */}
      <div className="flex justify-between items-start border-b border-white/10 pb-8 mb-8">
        <div>
          <h1 className="text-4xl font-extralight tracking-tighter uppercase italic leading-none">Control Comercial</h1>
          <p className="text-[9px] uppercase tracking-[0.4em] text-white/30 mt-3 font-bold">Boralba Living • Inteligencia Inmobiliaria</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex gap-2 bg-white/5 p-1 rounded-sm border border-white/5">
            <button onClick={() => setFilterType('all')} className={`px-4 py-1.5 text-[9px] uppercase tracking-widest transition-all ${filterType === 'all' ? 'bg-white text-black font-black' : 'text-white/40 hover:text-white'}`}>Todos</button>
            <button onClick={() => setFilterType('today')} className={`px-4 py-1.5 text-[9px] uppercase tracking-widest transition-all ${filterType === 'today' ? 'bg-yellow-500 text-black font-black' : 'text-yellow-500/40 hover:text-yellow-500'}`}>Hoy</button>
            <button onClick={() => setFilterType('urgent')} className={`px-4 py-1.5 text-[9px] uppercase tracking-widest transition-all ${filterType === 'urgent' ? 'bg-red-600 text-white font-black' : 'text-red-600/40 hover:text-red-600'}`}>Vencidos</button>
          </div>
          <button onClick={createProspect} className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 text-[10px] uppercase tracking-[0.2em] font-black italic transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)]">+ Nuevo Cliente</button>
        </div>
      </div>

      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="FILTRAR POR NOMBRE..." className="h-14 w-full bg-zinc-950 border border-white/10 px-6 text-[11px] uppercase tracking-[0.3em] mb-8 outline-none focus:border-purple-500/50 transition-all font-light" />

      {/* TABLA PRINCIPAL */}
      <div className="border border-white/10 bg-zinc-950 shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold italic">
              <th className="px-8 py-5">Asignación</th>
              <th className="px-8 py-5">Cliente / Unidad</th>
              <th className="px-8 py-5 text-center">Visita</th>
              <th className="px-8 py-5 text-center">Cotiz.</th>
              <th className="px-8 py-5 text-nowrap">Próx. Contacto</th>
              <th className="px-8 py-5">Estatus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredProspects.map((p) => {
              const alert = getAlertStatus(p.next_contact_date);
              const temp = TEMP_BADGE[p.temperature ?? ''] ?? { label: '—', dot: 'bg-zinc-800', text: 'text-zinc-500' }
              return (
                <tr key={p.id} className={`group transition-all ${alert === 'vencido' ? 'bg-red-500/[0.04]' : alert === 'hoy' ? 'bg-yellow-500/[0.04]' : 'hover:bg-white/[0.01]'}`}>
                  <td className="px-8 py-6 min-w-[200px] space-y-1">
                    <select value={p.team_id || ''} onChange={(e) => updateProspect(p.id, { team_id: e.target.value })} className="block w-full bg-transparent text-[9px] uppercase text-white/20 outline-none border-none cursor-pointer hover:text-white transition-colors">
                      <option value="">Sin Equipo</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <select value={p.assigned_to || ''} onChange={(e) => updateProspect(p.id, { assigned_to: e.target.value })} className="block w-full bg-transparent text-[10px] uppercase text-purple-400 font-black outline-none border-none cursor-pointer">
                      <option value="">Sin Asesor</option>
                      {advisors.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                    </select>
                  </td>
                  <td className="px-8 py-6 cursor-pointer" onClick={() => setSelectedProspect(p)}>
                    <p className="text-xs uppercase tracking-widest text-white group-hover:text-purple-400 font-bold underline decoration-white/10 underline-offset-8 transition-all">{p.full_name}</p>
                    <p className="text-[8px] text-white/40 mt-2 uppercase italic tracking-[0.2em]">{p.preferred_typology || 'Unidad no definida'}</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <input type="checkbox" checked={p.visited_site || false} onChange={(e) => updateProspect(p.id, { visited_site: e.target.checked })} className="w-4 h-4 accent-purple-600 cursor-pointer" />
                  </td>
                  <td className="px-8 py-6 text-center">
                    <input type="checkbox" checked={p.has_quote || false} onChange={(e) => updateProspect(p.id, { has_quote: e.target.checked })} className="w-4 h-4 accent-white cursor-pointer" />
                  </td>
                  <td className="px-8 py-6">
                    <input type="date" value={p.next_contact_date || ''} onChange={(e) => updateProspect(p.id, { next_contact_date: e.target.value })} className={`bg-transparent text-[10px] font-mono border-b px-1 outline-none cursor-pointer transition-all ${alert === 'vencido' ? 'border-red-500 text-red-500' : alert === 'hoy' ? 'border-yellow-500 text-yellow-500 font-bold' : 'border-white/10 text-white/40'}`} />
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${temp.dot} shadow-[0_0_8px_rgba(255,255,255,0.1)]`} />
                      <span className={`text-[10px] uppercase font-black tracking-widest ${temp.text}`}>{temp.label}</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* PANEL LATERAL DE EXPEDIENTE (RESTAURADO) */}
      {selectedProspect && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedProspect(null)} />
          <div className="relative w-full max-w-lg bg-zinc-950 border-l border-white/10 h-full p-12 shadow-[ -20px_0_50px_rgba(0,0,0,0.5)] overflow-y-auto animate-in slide-in-from-right duration-500">
            <button onClick={() => setSelectedProspect(null)} className="absolute top-8 right-8 text-white/20 hover:text-white text-[10px] uppercase tracking-[0.3em] border border-white/10 px-4 py-2 font-bold transition-all">Cerrar ✕</button>
            
            <div className="space-y-16 mt-16">
              <header className="border-b border-white/5 pb-10">
                <span className="text-[9px] uppercase tracking-[0.5em] text-purple-500 font-black italic">Expediente de Cliente</span>
                <h2 className="text-5xl font-extralight tracking-tighter uppercase italic text-white mt-4 leading-none">{selectedProspect.full_name}</h2>
              </header>

              <section className="space-y-12">
                {/* DATOS DE CONTACTO RESTAURADOS */}
                <div className="space-y-6">
                  <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold italic">Información de Contacto</h3>
                  <div className="grid gap-4">
                    <div className="bg-white/[0.02] border border-white/5 p-6">
                      <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] mb-2">WhatsApp / Celular</p>
                      <input 
                        type="text" 
                        value={selectedProspect.phone || ''} 
                        placeholder="+52..."
                        onChange={(e) => updateProspect(selectedProspect.id, { phone: e.target.value })}
                        className="bg-transparent text-lg font-mono text-white outline-none w-full border-b border-transparent focus:border-purple-500/50 pb-1 transition-all"
                      />
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-6">
                      <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] mb-2">Correo Electrónico</p>
                      <input 
                        type="email" 
                        value={selectedProspect.email || ''} 
                        placeholder="ejemplo@mail.com"
                        onChange={(e) => updateProspect(selectedProspect.id, { email: e.target.value })}
                        className="bg-transparent text-sm font-mono text-white outline-none w-full border-b border-transparent focus:border-purple-500/50 pb-1 transition-all lowercase"
                      />
                    </div>
                  </div>
                </div>

                {/* UNIDAD DE INTERÉS */}
                <div className="space-y-4">
                  <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold italic">Configuración de Interés</h3>
                  <div className="bg-white/[0.02] border border-white/5 p-6">
                    <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] mb-2">Unidad / Tipología Requerida</p>
                    <input 
                      type="text"
                      value={selectedProspect.preferred_typology || ''}
                      placeholder="Ej: Magnolia, Jacaranda, PH..."
                      onChange={(e) => updateProspect(selectedProspect.id, { preferred_typology: e.target.value })}
                      className="bg-transparent text-base uppercase tracking-widest text-white outline-none w-full border-b border-transparent focus:border-purple-500/50 pb-1 transition-all"
                    />
                  </div>
                </div>

                {/* BITÁCORA */}
                <div className="space-y-4">
                  <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold italic">Notas de Gestión</h3>
                  <textarea 
                    value={selectedProspect.notes || ''} 
                    onChange={(e) => updateProspect(selectedProspect.id, { notes: e.target.value })}
                    placeholder="Escribe aquí el resumen de la última llamada o visita..."
                    className="w-full bg-black border border-white/5 p-6 h-48 text-[11px] leading-relaxed text-white/60 italic outline-none focus:border-white/20 transition-all resize-none shadow-inner"
                  />
                </div>
              </section>

              <div className="pb-12">
                <button 
                  onClick={() => {
                    const msg = encodeURIComponent(`Hola ${selectedProspect.full_name}, te contacto de Blancarte Arquitectura sobre tu interés en Boralba Living...`);
                    window.open(`https://wa.me/${selectedProspect.phone?.replace(/\D/g,'')}?text=${msg}`, '_blank');
                  }}
                  className="w-full py-6 bg-white text-black text-[10px] uppercase tracking-[0.4em] font-black italic hover:bg-purple-600 hover:text-white transition-all duration-300"
                >
                  Contactar vía WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
