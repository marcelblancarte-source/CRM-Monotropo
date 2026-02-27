import { createClient } from '@/lib/supabase/server'

export default async function UsersPage() {
    const supabase = await createClient()

    // MOCK DATA
    const users = [
        { id: '1', full_name: 'Director General', email: 'admin@inmobiliaria.com', role: 'Super Admin', team: '—', status: 'Activo' },
        { id: '2', full_name: 'Ana Ramírez', email: 'ana@inmobiliaria.com', role: 'Líder de Equipo', team: 'Equipo Oro', status: 'Activo' },
        { id: '3', full_name: 'Carlos Pérez', email: 'carlos@inmobiliaria.com', role: 'Líder de Equipo', team: 'Equipo Plata', status: 'Activo' },
        { id: '4', full_name: 'María González', email: 'maria@inmobiliaria.com', role: 'Asesor de Ventas', team: 'Equipo Oro', status: 'Activo' },
        { id: '5', full_name: 'Jorge Herrera', email: 'jorge@inmobiliaria.com', role: 'Asesor de Ventas', team: 'Equipo Plata', status: 'Inactivo' },
    ]

    const getRoleColor = (role: string) => {
        if (role === 'Super Admin') return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-400'
        if (role === 'Líder de Equipo') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400'
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Administra los asesores, líderes y accesos del sistema.
                    </p>
                </div>
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>
                    Invitar Usuario
                </button>
            </div>

            <div className="rounded-md border bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="border-b bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-4 font-medium">Nombre</th>
                                <th className="px-6 py-4 font-medium">Correo</th>
                                <th className="px-6 py-4 font-medium">Rol</th>
                                <th className="px-6 py-4 font-medium">Equipo</th>
                                <th className="px-6 py-4 font-medium">Estatus</th>
                                <th className="px-6 py-4 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm dark:bg-blue-900/40 dark:text-blue-400">
                                            {user.full_name.charAt(0)}
                                        </div>
                                        {user.full_name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getRoleColor(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{user.team}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.status === 'Activo' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white mr-3">Editar</button>
                                        <button className="text-sm font-medium text-red-600 hover:text-red-800">Desactivar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
