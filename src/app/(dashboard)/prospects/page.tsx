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

const TEMP_OPTIONS = [
  { id: 'cold',    label: 'Frío',     dot: 'bg-zinc-500',   text: 'text-zinc-400' },
  { id: 'warm',    label: 'Tibio',    dot: 'bg-orange-500', text: 'text-orange-400' },
  { id: 'hot',     label: 'Caliente', dot: 'bg-purple-500', text: 'text-purple-400' },
  { id: 'medium',  label: 'Medio',    dot: 'bg-yellow-500', text: 'text-yellow-400' },
  { id: 'closing', label: 'Cierre',   dot: 'bg-white',      text: 'text-white' },
]

const TEMP_MAP: Record<string, any> = TEMP_OPTIONS.reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {});

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [teams, setTeams] = useState<{id: string, name: string}[]>([])
  const [advisors, setAdvisors] = useState<{id: string, full_name: string, team_id: string | null}[]>([])
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'urgent' | 'today'>('all')
  
  // Estados de Filtro Avanzado
  const [filterTeam, setFilterTeam] = useState<string>('all')
  const [filterAdvisor, setFilterAdvisor] = useState<string>('all')

  const supabase = createClient()

  async function loadInitialData() {
    const { data: pData } = await supabase.from('prospects').select('*').order('created_at', { ascending: false })
    const { data: tData } = await supabase.from('teams').select('id, name')
    const { data: uData } = await supabase.from('profiles').select('id, full_name, team_id')
    setProspects((pData as any) ?? [])
    setTeams((tData as any) ?? [])
    setAdvisors((uData as any) ?? [])
  }

  useEffect(() => { loadInitialData() }, [])

  async function deleteProspect(id: string, name: string) {
    if (!confirm(`¿Eliminar permanentemente a ${name}?`)) return;
    const { error } = await supabase.from('prospects').delete().eq('id', id);
    if (!error) { setSelectedProspect(null); loadInitialData(); }
  }

  async function updateProspect(id: string, updates: Partial<Prospect>, isNoteUpdate: boolean = false) {
    let finalUpdates = { ...updates };
    if (isNoteUpdate) finalUpdates.last_contact_date = new Date().toISOString().split('T')[0];
    setProspects(curr => curr.map(p => (p.id === id ? { ...p, ...finalUpdates } : p)));
    if (selectedProspect?.id === id) setSelectedProspect(prev => prev ? { ...prev, ...finalUpdates } : null);
    await supabase.from('prospects').update(finalUpdates).eq('id', id);
  }

  // Filtrado de asesores según el equipo seleccionado
  const visibleAdvisors = filterTeam === 'all' 
    ? advisors 
    : advisors.filter(a => a.team_id === filterTeam);

  // Filtrado Maestro de la Tabla
  const filteredProspects = prospects.filter(p => {
    const matchesSearch = p.full_name.toLowerCase().includes(search.toLowerCase());
    const matchesTeam = filterTeam === 'all' || p.team_id === filterTeam;
    const matchesAdvisor = filterAdvisor === 'all' || p.assigned_to === filterAdvisor;
    
    const today = new Date(); today.setHours(0,0,0,0);
    const nextDate = p.next_contact_date ? new Date(p.next_contact_date + 'T00:00:00') : null;
    
    let matchesTime = true;
    if (filterType === 'urgent') matchesTime = nextDate ? nextDate < today : false;
    if (filterType === 'today') matchesTime = nextDate ? nextDate.getTime() === today.getTime() : false;

    return matchesSearch && matchesTeam && matchesAdvisor && matchesTime;
  });

  const stats = {
    total: filteredProspects.length,
    hot: filteredProspects.filter(p => p.temperature === 'hot' || p.temperature === 'closing').length,
    conversion: filteredProspects.length > 0 
      ? Math.round((filteredProspects.filter(p => p.has_quote && p.visited_site).length / filteredProspects.length) * 100) 
      : 0
  };

  return (
    <div className="relative min-h-screen bg-black text-white p-8 font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-white/10 pb-8 mb-12">
        <div>
          <h1 className="text-5xl font-extralight tracking-tighter uppercase italic leading-none">Boralba Living</h1>
          <p className="text-[9px] uppercase tracking-[0.5em] text-purple-500 mt-4 font-black italic">Gestión por Células de Venta</p>
        </div>
      </div>

      {/* DASHBOARD DINÁMICO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-zinc-950 border border-white/5 p-8">
          <p className="text-[8px] uppercase tracking-[0.4em] text-white/20 mb-2 font-bold italic">Leads en Selección</p>
          <p className="text-4xl font-extralight italic">{stats.total}</p>
        </div>
        <div className="bg-zinc-950 border border-purple-500/20 p-8">
          <p className="text-[8px] uppercase tracking-[0.4em] text-purple-400 mb-2 font-bold italic">Leads Calientes</p>
          <p className="text-4xl font-extralight italic text-purple-400">{stats.hot}</p>
        </div>
        <div className="bg-zinc-950 border border-white/5 p-8">
          <p className="text-[8px] uppercase tracking-[0.4em] text-white/20 mb-2 font-bold italic">% Conversión del Grupo</p>
          <p className="text-4xl font-extralight italic">{stats.conversion}%</p>
        </div>
      </div>

      {/* BARRA DE FILTROS AVANZADOS */}
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="BUSCAR NOMBRE..." className="h-12 bg-zinc-900 border border-white/10 px-6 text-[10px] uppercase tracking-[0.2em] outline-none focus:border-purple-500/40" />
          
          <select 
            value={filterTeam} 
            onChange={e => { setFilterTeam(e.target.value); setFilterAdvisor('all'); }} 
            className="h-12 bg-zinc-900 border border-white/10 px-4 text-[10px] uppercase tracking-[0.2em] outline-none text-white/60"
          >
            <option value="all">TODOS LOS EQUIPOS</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <select 
            value={filterAdvisor} 
            onChange={e => setFilterAdvisor(e.target.value)} 
            className="h-12 bg-zinc-900 border border-white/10 px-4 text-[10px] uppercase tracking-[0.2em] outline-none text-purple-400 font-bold"
          >
            <option value="all">TODOS LOS ASESORES</option>
            {visibleAdvisors.map(a => <option key={a.id} value={a.id}>{a.full_name}</option>)}
          </select>

          <div className="flex gap-1 bg-zinc-900 p-1 border border-white/10">
            <button onClick={() => setFilterType('all')} className={`flex-1 text-[8px] uppercase tracking-widest transition-all ${filterType === 'all' ? 'bg-white text-black font-black' : 'text-white/30'}`}>Todos</button>
            <button onClick={() => setFilterType('today')} className={`flex-1 text-[8px] uppercase tracking-widest transition-all ${filterType === 'today' ? 'bg-yellow-500 text-black font-black' : 'text-yellow-500/30'}`}>Hoy</button>
            <button onClick={() => setFilterType('urgent')} className={`flex-1 text-[8px] uppercase tracking-widest transition-all ${filterType === 'urgent' ? 'bg-red-600 text-white font-black' : 'text-red-600/30'}`}>Vencidos</button>
          </div>
        </div>
      </div>

      {/* TABLA MAESTRA */}
      <div className="border border-white/10 bg-zinc-950 shadow-2xl overflow-hidden">
        <table className="w-full text-left border-collapse text-[11px] uppercase tracking-tighter">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] text-[8px] uppercase tracking-[0.2em] text-white/30 font-bold italic">
              <th className="px-8 py-5">Equipo</th>
              <th className="px-8 py-5">Asesor</th>
              <th className="px-8 py-5">Cliente</th>
              <th className="px-8 py-5 text-center">Último C.</th>
              <th className="px-8 py-5 text-center">Estatus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredProspects.map((p) => {
              const t = TEMP_MAP[p.temperature ?? 'cold'] || TEMP_MAP['cold'];
              const teamName = teams.find(tm => tm.id === p.team_id)?.name || 'Sin Equipo';
              const advisorName = advisors.find(ad => ad.id === p.assigned_to)?.full_name || 'Sin Asesor';
              return (
                <tr key={p.id} className="hover:bg-white/[0.01] transition-all group">
                  <td className="px-8 py-6 text-white/20 font-bold group-hover:text-white/40">{teamName}</td>
                  <td className="px-8 py-6 text-purple-400 font-black">{advisorName}</td>
                  <td className="px-8 py-6 cursor-pointer" onClick={() => setSelectedProspect(p)}>
                    <p className="text-white group-hover:text-purple-400 transition-all font-bold underline decoration-white/5 underline-offset-4">{p.full_name}</p>
                  </td>
                  <td className="px-8 py-6 text-center text-white/30 font-mono italic">
                    {p.last_contact_date?.split('-').reverse().join('/') || '—'}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
                      <span className={`text-[9px] font-black ${t.text}`}>{t.label}</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* PANEL LATERAL (EXPEDIENTE) */}
      {selectedProspect && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedProspect(null)} />
          <div className="relative w-full max-w-lg bg-zinc-950 border-l border-white/10 h-full p-12 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-500">
            <header className="border-b border-white/5 pb-10 mb-10">
              <span className="text-[9px] uppercase tracking-[0.5em] text-purple-500 font-black italic">Expediente Maestro</span>
              <h2 className="text-4xl font-extralight tracking-tighter uppercase italic text-white mt-4">{selectedProspect.full_name}</h2>
            </header>

            <div className="space-y-8">
              {/* ASIGNACIÓN EN EL EXPEDIENTE */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[8px] text-white/30 uppercase font-bold">Equipo</p>
                  <select value={selectedProspect.team_id || ''} onChange={(e) => updateProspect(selectedProspect.id, { team_id: e.target.value })} className="w-full bg-zinc-900 border border-white/10 p-3 text-[10px] text-white outline-none">
                    <option value="">Sin Equipo</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <p className="text-[8px] text-white/30 uppercase font-bold">Asesor</p>
                  <select value={selectedProspect.assigned_to || ''} onChange={(e) => updateProspect(selectedProspect.id, { assigned_to: e.target.value })} className="w-full bg-zinc-900 border border-white/10 p-3 text-[10px] text-purple-400 font-bold outline-none">
                    <option value="">Sin Asesor</option>
                    {advisors.map(a => <option key={a.id} value={a.id}>{a.full_name}</option>)}
                  </select>
                </div>
              </div>

              {/* TEMPERATURA */}
              <div>
                <p className="text-[8px] text-white/30 uppercase font-bold mb-3">Estatus Comercial</p>
                <div className="grid grid-cols-3 gap-2">
                  {TEMP_OPTIONS.map((opt) => (
                    <button key={opt.id} onClick={() => updateProspect(selectedProspect.id, { temperature: opt.id })} className={`py-3 border text-[9px] font-black tracking-widest transition-all ${selectedProspect.temperature === opt.id ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}>{opt.label}</button>
                  ))}
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 p-6 space-y-4">
                <input type="text" value={selectedProspect.phone || ''} onChange={(e) => updateProspect(selectedProspect.id, { phone: e.target.value })} placeholder="WhatsApp..." className="w-full bg-transparent border-b border-white/10 text-lg font-mono text-white outline-none focus:border-purple-500 pb-2" />
                <input type="email" value={selectedProspect.email || ''} onChange={(e) => updateProspect(selectedProspect.id, { email: e.target.value })} placeholder="Email..." className="w-full bg-transparent border-b border-white/10 text-sm font-mono text-white/60 outline-none lowercase" />
              </div>

              <textarea value={selectedProspect.notes || ''} onChange={(e) => updateProspect(selectedProspect.id, { notes: e.target.value }, true)} placeholder="Notas de seguimiento..." className="w-full bg-black border border-white/5 p-6 h-40 text-[11px] leading-relaxed text-white/60 italic outline-none focus:border-white/20 resize-none shadow-inner" />

              <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                <button onClick={() => window.open(`https://wa.me/${selectedProspect.phone?.replace(/\D/g,'')}`, '_blank')} className="w-full py-5 bg-white text-black text-[10px] uppercase font-black italic hover:bg-purple-600 hover:text-white transition-all">Contactar por WhatsApp</button>
                <button onClick={() => deleteProspect(selectedProspect.id, selectedProspect.full_name)} className="text-[8px] uppercase text-red-600/40 hover:text-red-600 font-bold transition-all">Eliminar Prospecto</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
