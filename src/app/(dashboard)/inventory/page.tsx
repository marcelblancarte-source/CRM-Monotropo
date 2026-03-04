'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Unit = {
  id: string
  tower: string | null
  unit_number: string | null
  floor: number | null
  typology: string | null
  sqm_construction: number | null
  sqm_terrace: number | null
  list_price: number | null
  status: string | null
  description: string | null
}

const STATUS_COLORS: Record<string, string> = {
  available:  'bg-green-900/40 text-green-400',
  reserved:   'bg-yellow-900/40 text-yellow-400',
  sold:       'bg-red-900/40 text-red-400',
  in_process: 'bg-blue-900/40 text-blue-400',
}

const STATUS_LABELS: Record<string, string> = {
  available:  'Disponible',
  reserved:   'Apartado',
  sold:       'Vendido',
  in_process: 'En Proceso',
}

export default function InventoryPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [saving, setSaving] = useState(false)

  const [tower, setTower] = useState('')
  const [unitNumber, setUnitNumber] = useState('')
  const [floor, setFloor] = useState('')
  const [typology, setTypology] = useState('')
  const [sqmConstruction, setSqmConstruction] = useState('')
  const [sqmTerrace, setSqmTerrace] = useState('')
  const [listPrice, setListPrice] = useState('')
  const [status, setStatus] = useState('available')
  const [description, setDescription] = useState('')

  const supabase = createClient()

  async function loadUnits() {
    setLoading(true)
    const { data } = await supabase
      .from('units')
      .select('*')
      .order('tower')
    setUnits(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadUnits() }, [])

  function openNew() {
    setEditingUnit(null)
    setTower('')
    setUnitNumber('')
    setFloor('')
    setTypology('')
    setSqmConstruction('')
    setSqmTerrace('')
    setListPrice('')
    setStatus('available')
    setDescription('')
    setShowModal(true)
  }

  function openEdit(unit: Unit) {
    setEditingUnit(unit)
    setTower(unit.tower ?? '')
    setUnitNumber(unit.unit_number ?? '')
    setFloor(unit.floor?.toString() ?? '')
    setTypology(unit.typology ?? '')
    setSqmConstruction(unit.sqm_construction?.toString() ?? '')
    setSqmTerrace(unit.sqm_terrace?.toString() ?? '')
    setListPrice(unit.list_price?.toString() ?? '')
    setStatus(unit.status ?? 'available')
    setDescription(unit.description ?? '')
    setShowModal(true)
  }

  async function saveUnit() {
    if (!unitNumber.trim()) return
    setSaving(true)
    const payload = {
      tower: tower || null,
      unit_number: unitNumber,
      floor: floor ? parseInt(floor) : null,
      typology: typology || null,
      sqm_construction: sqmConstruction ? parseFloat(sqmConstruction) : null,
      sqm_terrace: sqmTerrace ? parseFloat(sqmTerrace) : null,
      list_price: listPrice ? parseFloat(listPrice) : null,
      status,
      description: description || null,
    }
    if (editingUnit) {
      await supabase.from('units').update(payload).eq('id', editingUnit.id)
    } else {
      await supabase.from('units').insert(payload)
    }
    setSaving(false)
    setShowModal(false)
    loadUnits()
  }

  async function deleteUnit(id: string) {
    if (!confirm('¿Eliminar esta unidad?')) return
    await supabase.from('units').delete().eq('id', id)
    loadUnits()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventario de Unidades</h1>
          <p className="text-sm text-white/40 mt-1">Gestiona las propiedades del desarrollo y su disponibilidad.</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-lg bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition-all"
        >
          <span className="text-lg leading-none">+</span> Nueva Unidad
        </button>
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-white/10 bg-zinc-950">
            <tr>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-white/40 font-medium">Unidad</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-white/40 font-medium">Torre / Nivel</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-white/40 font-medium">Tipología</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-white/40 font-medium">Área</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-white/40 font-medium">Precio Lista</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-white/40 font-medium">Estatus</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-white/40 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-white/40 text-sm">Cargando inventario...</td></tr>
            ) : units.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-white/40 text-sm">No hay unidades registradas.</td></tr>
            ) : (
              units.map((unit) => (
                <tr key={unit.id} className="hover:bg-white/5 transition-all">
                  <td className="px-6 py-4 font-medium text-white">{unit.unit_number}</td>
                  <td className="px-6 py-4 text-white/50">{unit.tower ?? '—'} {unit.floor ? `· Nivel ${unit.floor}` : ''}</td>
                  <td className="px-6 py-4 text-white/50">{unit.typology ?? '—'}</td>
                  <td className="px-6 py-4 text-white/50">
                    {unit.sqm_construction ? `${unit.sqm_construction} m²` : '—'}
                    {unit.sqm_terrace ? ` + ${unit.sqm_terrace} m² terraza` : ''}
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    {unit.list_price ? `$${unit.list_price.toLocaleString('es-MX')}` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[unit.status ?? ''] ?? 'bg-zinc-800 text-zinc-300'}`}>
                      {STATUS_LABELS[unit.status ?? ''] ?? unit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => openEdit(unit)} className="text-xs text-white/40 hover:text-white transition-all">Editar</button>
                    <button onClick={() => deleteUnit(unit.id)} className="text-xs text-red-500 hover:text-red-400">Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 overflow-y-auto py-8">
          <div className="w-full max-w-lg rounded-xl border border-white/10 bg-zinc-950 p-6 space-y-4">
            <h2 className="text-lg font-bold">{editingUnit ? 'Editar Unidad' : 'Nueva Unidad'}</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/40 uppercase tracking-widest">Torre / Edificio</label>
                <input value={tower} onChange={e => setTower(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                  placeholder="Torre A" />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-widest">Número de depto *</label>
                <input value={unitNumber} onChange={e => setUnitNumber(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                  placeholder="101" />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-widest">Nivel / Piso</label>
                <input value={floor} onChange={e => setFloor(e.target.value)} type="number"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                  placeholder="1" />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-widest">Tipología</label>
                <select value={typology} onChange={e => setTypology(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30">
                  <option value="">Seleccionar</option>
                  <option value="Estudio">Estudio</option>
                  <option value="1 Recámara">1 Recámara</option>
                  <option value="2 Recámaras">2 Recámaras</option>
                  <option value="3 Recámaras">3 Recámaras</option>
                  <option value="Penthouse">Penthouse</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-widest">m² construcción</label>
                <input value={sqmConstruction} onChange={e => setSqmConstruction(e.target.value)} type="number"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                  placeholder="90" />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-widest">m² terraza</label>
                <input value={sqmTerrace} onChange={e => setSqmTerrace(e.target.value)} type="number"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                  placeholder="0" />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-widest">Precio de lista</label>
                <input value={listPrice} onChange={e => setListPrice(e.target.value)} type="number"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                  placeholder="2500000" />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-widest">Estatus</label>
                <select value={status} onChange={e => setStatus(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30">
                  <option value="available">Disponible</option>
                  <option value="reserved">Apartado</option>
                  <option value="in_process">En Proceso</option>
                  <option value="sold">Vendido</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest">Descripción / Amenidades</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                placeholder="Características especiales, amenidades, vista..." />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-white/50 hover:text-white">Cancelar</button>
              <button onClick={saveUnit} disabled={saving}
                className="px-4 py-2 text-sm bg-white text-black rounded-lg hover:bg-white/90 disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
