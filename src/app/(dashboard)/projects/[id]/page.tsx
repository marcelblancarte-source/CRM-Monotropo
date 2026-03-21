'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const TEMP_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  cold:    { label: 'Frío',     color: 'text-zinc-400',   bg: 'bg-zinc-800' },
  warm:    { label: 'Tibio',    color: 'text-orange-400', bg: 'bg-orange-900/40' },
  medium:  { label: 'Medio',    color: 'text-yellow-400', bg: 'bg-yellow-900/40' },
  hot:     { label: 'Caliente', color: 'text-green-400',  bg: 'bg-green-900/40' },
  closing: { label: 'Cierre',   color: 'text-purple-400', bg: 'bg-purple-900/40' },
}

export default function ProjectPage() {
  const { id } = useParams()
  const [project, setProject] = useState<any>(null)
  const [prospects, setProspects] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'prospects' | 'inventory' | 'metrics'>('prospects')

  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => { loadData() }, [id])

  async function loadData() {
    setLoading(true)
    const [{ data: projectData }, { data: prospectsData }, { data: unitsData }] = await Promise.all([
      supabase.from('projects').select('*').eq('id', id).single(),
      supabase.from('prospect_projects')
        .select('*, prospects(*, users(full_name), teams(name))')
        .eq('project_id', id),
      supabase.from('units').select('*').eq('project_id', id).order('unit_number'),
    ])
    setProject(projectData)
    setProspects((prospectsData ?? []).map((pp: any) => ({ ...pp.prospects, pp_temperature: pp.temperature, pp_notes: pp.notes })))
    setUnits(unitsData ?? [])
    setLoading(false)
  }

  if (loading) return <p className="text-white/40 text-sm p-8">Cargando proyecto...</p>
  if (!project) return <p className="text-white/40 text-sm p-8">Proyecto no encontrado.</p>

  const totalUnits = units.length
  const availableUnits = units.filter(u => u.status === 'available').length
  const soldUnits = units.filter(u => u.status === 'sold').length
  const reservedUnits = units.filter(u => u.status === 'reserved').length
  const hotProspects = prospects.filter(p => p.temperature === 'hot' || p.temperature === 'closing').length
  const visitedProspects = prospects.filter(p => p.visited).length
  const quotedProspects = prospects.filter(p => p.has_quote).length
  const overdueProspects = prospects.filter(p => p.next_followup_date && p.next_followup_date < today).length

  const STATUS_COLORS: Record<string, string> = {
    available:  'bg-green-900/40 text-green-400',
    reserved:   'bg-yellow-900/40 text-yellow-400',
    sold:       'bg-red-900/40 text-red-400',
    in_process: 'bg-blue-900/40 text-blue-400',
  }
  const STATUS_LABELS: Record<string, string> = {
    available: 'Disponible', reserved: 'Apartado', sold: 'Vendido', in_process: 'En Proceso',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <p className="text-[9px] uppercase tracking-[0.3em] text-purple-400 mb-2">Proyecto</p>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extralight tracking-tighter uppercase">{project.name}</h1>
            {project.description && <p className="text-sm text-white/40 mt-1">{project.description}</p>}
            {project.location && <p className="text-xs text-white/30 mt-0.5">📍 {project.location}</p>}
          </div>
          <span className={`text-[10px] uppercase tracking-widest px-3 py-1 border ${project.status === 'active' ? 'border-green-500/30 text-green-400' : 'border-white/10 text-white/40'}`}>
            {project.status === 'active' ? 'Activo' : project.status}
          </span>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10 lg:grid-cols-4">
        <div className="bg-black px-6 py-4 text-center">
          <p className="text-3xl font-light">{prospects.length}</p>
          <p className="text-[9px] uppercase tracking-widest text-white/30 mt-1">Prospectos</p>
        </div>
        <div className="bg-black px-6 py-4 text-center">
          <p className="text-3xl font-light text-purple-400">{hotProspects}</p>
          <p className="text-[9px] uppercase tracking-widest text-white/30 mt-1">Calientes</p>
        </div>
        <div className="bg-black px-6 py-4 text-center">
          <p className="text-3xl font-light text-green-400">{availableUnits}</p>
          <p className="text-[9px] uppercase tracking-widest text-white/30 mt-1">Unidades Disp.</p>
        </div>
        <div className="bg-black px-6 py-4 text-center">
          <p className="text-3xl font-light text-red-400">{overdueProspects}</p>
          <p className="text-[9px] uppercase tracking-widest text-white/30 mt-1">Seguim. Vencidos</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {[['prospects', 'Prospectos'], ['inventory', 'Inventario'], ['metrics', 'Métricas']].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'border-b-2 border-white text-white' : 'text-white/30 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Prospectos */}
      {activeTab === 'prospects' && (
        <div className="space-y-4">
          {prospects.length === 0 ? (
            <div className="rounded-xl border border-white/10 p-12 text-center">
              <p className="text-white/30 text-sm">No hay prospectos vinculados a este proyecto.</p>
              <Link href="/prospects" className="mt-4 text-xs text-purple-400 hover:text-purple-300 block">
                Ir a Prospectos para vincular →
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="border-b border-white/10 bg-zinc-950">
                  <tr>
                    <th className="px-4 py-3 text-left text-[9px] uppercase tracking-widest text-white/30 font-normal">Cliente</th>
                    <th className="px-4 py-3 text-left text-[9px] uppercase tracking-widest text-white/30 font-normal">Asesor</th>
                    <th className="px-4 py-3 text-left text-[9px] uppercase tracking-widest text-white/30 font-normal">Último Contacto</th>
                    <th className="px-4 py-3 text-left text-[9px] uppercase tracking-widest text-white/30 font-normal">Próx. Seguimiento</th>
                    <th className="px-4 py-3 text-center text-[9px] uppercase tracking-widest text-white/30 font-normal">Visita</th>
                    <th className="px-4 py-3 text-center text-[9px] uppercase tracking-widest text-white/30 font-normal">Cotiz.</th>
                    <th className="px-4 py-3 text-left text-[9px] uppercase tracking-widest text-white/30 font-normal">Temperatura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {prospects.map(p => {
                    const followupOverdue = p.next_followup_date && p.next_followup_date < today
                    const followupToday = p.next_followup_date === today
                    const advisorName = Array.isArray(p.users) ? p.users[0]?.full_name : p.users?.full_name
                    return (
                      <tr key={p.id} className="hover:bg-white/5 transition-all">
                        <td className="px-4 py-3">
                          <p className="font-medium text-white">{p.full_name}</p>
                          {p.preferred_typology && <p className="text-white/30 text-[10px]">{p.preferred_typology}</p>}
                        </td>
                        <td className="px-4 py-3 text-purple-400">{advisorName ?? '—'}</td>
                        <td className="px-4 py-3 text-white/40">
                          {p.last_contact_date ? new Date(p.last_contact_date + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          {p.next_followup_date ? (
                            <span className={`text-[10px] ${followupOverdue ? 'text-red-400' : followupToday ? 'text-yellow-400' : 'text-white/50'}`}>
                              {followupOverdue && '⚠ '}{followupToday && '● '}
                              {new Date(p.next_followup_date + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                            </span>
                          ) : <span className="text-white/20">—</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={p.visited ? 'text-green-400' : 'text-white/20'}>
                            {p.visited ? '✓' : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={p.has_quote ? 'text-green-400' : 'text-white/20'}>
                            {p.has_quote ? '✓' : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${TEMP_CONFIG[p.temperature ?? '']?.bg ?? 'bg-zinc-800'} ${TEMP_CONFIG[p.temperature ?? '']?.color ?? 'text-zinc-400'}`}>
                            {TEMP_CONFIG[p.temperature ?? '']?.label ?? '—'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Inventario */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-px bg-white/10 border border-white/10">
            <div className="bg-black px-4 py-3 text-center">
              <p className="text-2xl font-light text-green-400">{availableUnits}</p>
              <p className="text-[9px] uppercase tracking-widest text-white/30 mt-1">Disponibles</p>
            </div>
            <div className="bg-black px-4 py-3 text-center">
              <p className="text-2xl font-light text-yellow-400">{reservedUnits}</p>
              <p className="text-[9px] uppercase tracking-widest text-white/30 mt-1">Apartados</p>
            </div>
            <div className="bg-black px-4 py-3 text-center">
              <p className="text-2xl font-light text-red-400">{soldUnits}</p>
              <p className="text-[9px] uppercase tracking-widest text-white/30 mt-1">Vendidos</p>
            </div>
            <div className="bg-black px-4 py-3 text-center">
              <p className="text-2xl font-light">{totalUnits}</p>
              <p className="text-[9px] uppercase tracking-widest text-white/30 mt-1">Total</p>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="border-b border-white/10 bg-zinc-950">
                <tr>
                  <th className="px-4 py-3 text-left text-[9px] uppercase tracking-widest text-white/30 font-normal">Unidad</th>
                  <th className="px-4 py-3 text-left text-[9px] uppercase tracking-widest text-white/30 font-normal">Tipología</th>
                  <th className="px-4 py-3 text-left text-[9px] uppercase tracking-widest text-white/30 font-normal">Nivel</th>
                  <th className="px-4 py-3 text-left text-[9px] uppercase tracking-widest text-white/30 font-normal">Área</th>
                  <th className="px-4 py-3 text-left text-[9px] uppercase tracking-widest text-white/30 font-normal">Precio</th>
                  <th className="px-4 py-3 text-left text-[9px] uppercase tracking-widest text-white/30 font-normal">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {units.map(u => (
                  <tr key={u.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-medium text-white">{u.unit_number}</td>
                    <td className="px-4 py-3 text-white/50">{u.typology ?? '—'}</td>
                    <td className="px-4 py-3 text-white/50">{u.floor ?? '—'}</td>
                    <td className="px-4 py-3 text-white/50">{u.sqm_construction ? `${u.sqm_construction} m²` : '—'}</td>
                    <td className="px-4 py-3 font-medium text-white">{u.list_price ? `$${u.list_price.toLocaleString('es-MX')}` : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[u.status ?? ''] ?? 'bg-zinc-800 text-zinc-300'}`}>
                        {STATUS_LABELS[u.status ?? ''] ?? u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Métricas */}
      {activeTab === 'metrics' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="border border-white/10 bg-zinc-950 p-6">
            <h3 className="text-[10px] uppercase tracking-widest text-white/40 mb-6">Embudo de Conversión</h3>
            <div className="space-y-6">
              {[
                { label: 'Prospectos', count: prospects.length, total: prospects.length },
                { label: 'Con Visita', count: visitedProspects, total: prospects.length },
                { label: 'Con Cotización', count: quotedProspects, total: prospects.length },
                { label: 'Calientes / Cierre', count: hotProspects, total: prospects.length },
              ].map(({ label, count, total }) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                  <div key={label}>
                    <div className="flex justify-between text-[10px] uppercase tracking-widest mb-2 text-white/60">
                      <span>{label}</span>
                      <span className="font-mono">{count} <span className="text-white/30">({pct}%)</span></span>
                    </div>
                    <div className="h-px bg-white/10 relative">
                      <div className="absolute top-0 left-0 h-full bg-purple-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="border border-white/10 bg-zinc-950 p-6">
            <h3 className="text-[10px] uppercase tracking-widest text-white/40 mb-6">Distribución de Temperatura</h3>
            <div className="space-y-4">
              {Object.entries(TEMP_CONFIG).map(([key, val]) => {
                const count = prospects.filter(p => p.temperature === key).length
                const pct = prospects.length > 0 ? Math.round((count / prospects.length) * 100) : 0
                return (
                  <div key={key} className="flex items-center gap-4">
                    <span className={`text-[10px] uppercase tracking-widest w-20 shrink-0 ${val.color}`}>{val.label}</span>
                    <div className="flex-1 h-px bg-white/10 relative">
                      <div className="absolute top-0 left-0 h-full bg-white/40 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-white/30 w-8 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
