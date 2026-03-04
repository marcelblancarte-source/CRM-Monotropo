'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Team = { id: string; name: string }

type UserProfile = {
  id: string
  full_name: string | null
  email: string | null
  role_id: string | null
  team_id: string | null
  sys_roles: { name: string } | null
  teams: { name: string } | null
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  team_leader: 'Líder de Equipo',
  sales_advisor: 'Asesor de Ventas',
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-purple-900/40 text-purple-400',
  team_leader: 'bg-blue-900/40 text-blue-400',
  sales_advisor: 'bg-zinc-800 text-zinc-300',
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [saving, setSaving] = useState(false)

  // Form fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [roleId, setRoleId] = useState('')
  const [teamId, setTeamId] = useState('')

  const supabase = createClient()

  async function loadData() {
    setLoading(true)
    const [{ data: usersData }, { data: teamsData }, { data: rolesData }] = await Promise.all([
      supabase.from('users').select('*, sys_roles(name), teams(name)').order('full_name'),
      supabase.from('teams').select('id, name').order('name'),
      supabase.from('sys_roles').select('id, name'),
    ])
    setUsers(usersData ?? [])
    setTeams(teamsData ?? [])
    setRoles(rolesData ?? [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  function openNew() {
    setEditingUser(null)
    setFullName('')
    setEmail('')
    setPassword('')
    setRoleId(roles.find(r => r.name === 'sales_advisor')?.id ?? '')
    setTeamId('')
    setShowModal(true)
  }

  function openEdit(user: UserProfile) {
    setEditingUser(user)
    setFullName(user.full_name ?? '')
    setEmail(user.email ?? '')
    setPassword('')
    setRoleId(user.role_id ?? '')
    setTeamId(user.team_id ?? '')
    setShowModal(true)
  }

  async function saveUser() {
    if (!fullName.trim() || !email.trim()) return
    setSaving(true)

    if (editingUser) {
      // Solo actualizar perfil
      await supabase.from('users').update({
        full_name: fullName,
        role_id: roleId || null,
        team_id: teamId || null,
      }).eq('id', editingUser.id)
    } else {
      // Crear usuario en Auth + perfil
      const res = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, roleId, teamId }),
      })
      if (!res.ok) {
        alert('Error al crear usuario. Verifica que el email no exista ya.')
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setShowModal(false)
    loadData()
  }

  async function deleteUser(id: string) {
    if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return
    await supabase.from('users').delete().eq('id', id)
    loadData()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-sm text-white/40 mt-1">Administra asesores, líderes y accesos del sistema.</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-lg bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition-all"
        >
          <span className="text-lg leading-none">+</span> Nuevo Usuario
        </button>
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-white/10 bg-zinc-950">
            <tr>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-white/40 font-medium">Nombre</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-white/40 font-medium">Correo</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-white/40 font-medium">Rol</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-white/40 font-medium">Equipo</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-white/40 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-white/40 text-sm">Cargando usuarios...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-white/40 text-sm">No hay usuarios registrados.</td></tr>
            ) : (
              users.map((user) => {
                const roleName = user.sys_roles?.name ?? ''
                return (
                  <tr key={user.id} className="hover:bg-white/5 transition-all">
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {(user.full_name ?? 'U').charAt(0).toUpperCase()}
                      </div>
                      {user.full_name ?? '—'}
                    </td>
                    <td className="px-6 py-4 text-white/50">{user.email ?? '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_COLORS[roleName] ?? 'bg-zinc-800 text-zinc-300'}`}>
                        {ROLE_LABELS[roleName] ?? roleName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/50">{user.teams?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => openEdit(user)} className="text-xs text-white/40 hover:text-white transition-all">Editar</button>
                      <button onClick={() => deleteUser(user.id)} className="text-xs text-red-500 hover:text-red-400">Eliminar</button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-zinc-950 p-6 space-y-4">
            <h2 className="text-lg font-bold">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>

            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest">Nombre completo *</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                placeholder="Nombre Apellido" />
            </div>

            {!editingUser && (
              <>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-widest">Correo electrónico *</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                    placeholder="correo@empresa.com" />
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-widest">Contraseña *</label>
                  <input value={password} onChange={e => setPassword(e.target.value)} type="password"
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                    placeholder="Mínimo 6 caracteres" />
                </div>
              </>
            )}

            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest">Rol</label>
              <select value={roleId} onChange={e => setRoleId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30">
                <option value="">Seleccionar rol</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{ROLE_LABELS[r.name] ?? r.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-white/40 uppercase tracking-widest">Equipo</label>
              <select value={teamId} onChange={e => setTeamId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30">
                <option value="">Sin equipo (Super Admin)</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-white/50 hover:text-white">Cancelar</button>
              <button onClick={saveUser} disabled={saving}
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
