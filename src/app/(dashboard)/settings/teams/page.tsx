'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Team = {
  id: string
  name: string
  description: string | null
  created_at: string
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  async function loadTeams() {
    setLoading(true)
    const { data } = await supabase.from('teams').select('*').order('created_at')
    setTeams(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadTeams() }, [])

  function openNew() {
    setEditingTeam(null)
    setName('')
    setDescription('')
    setShowModal(true)
  }

  function openEdit(team: Team) {
    setEditingTeam(team)
    setName(team.name)
    setDescription(team.description ?? '')
    setShowModal(true)
  }

  async function saveTeam() {
    if (!name.trim()) return
    setSaving(true)
    if (editingTeam) {
      await supabase.from('teams').update({ name, description }).eq('id', editingTeam.id)
    } else {
      await supabase.from('teams').insert({ name, description })
    }
    setSaving(false)
    setShowModal(false)
    loadTeams()
  }

  async function deleteTeam(id: string) {
    if (!confirm('¿Eliminar este equipo?')) return
    await supabase.from('teams').delete().eq('id', id)
    loadTeams()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipos de Venta</h1>
          <p className="text-sm text-white/40 mt-1">Administra los equipos de ventas.</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-lg bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition-all"
        >
          <span className="text-lg leading-none">+</span> Nuevo Equipo
        </button>
      </div>

      {loading ? (
        <p className="text-white/40 text-sm">Cargando equipos...</p>
      ) : teams.length === 0 ? (
        <div className="rounded-xl border border-white/10 p-12 text-center">
          <p className="text-white/40 text-sm">No hay equipos registrados.</p>
          <button onClick={openNew} className="mt-4 text-sm text-white underline">
            Crear el primero
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <div key={team.id} className="rounded-xl border border-white/10 bg-zinc-950 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">{team.name}</h3>
                <button
                  onClick={() => openEdit(team)}
                  className="text-xs text-white/40 hover:text-white transition-all"
                >
                  Editar
                </button>
              </div>
              {team.description && (
                <p className="text-xs text-white/40 mb-4">{team.description}</p>
              )}
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => deleteTeam(team.id)}
                  className="text-xs text-red-500 hover:text-red-400"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-zinc-950 p-6 space-y-4">
            <h2 className="text-lg font-bold">
              {editingTeam ? 'Editar Equipo' : 'Nuevo Equipo'}
            </h2>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest">
                Nombre *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                placeholder="Ej. Equipo Oro"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                rows={3}
                placeholder="Descripción opcional"
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-white/50 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={saveTeam}
                disabled={saving}
                className="px-4 py-2 text-sm bg-white text-black rounded-lg hover:bg-white/90 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
