import { createClient } from '@/lib/supabase/server'

export default async function TeamsPage() {
    const supabase = await createClient()

    // MOCK DATA
    const teams = [
        { id: '1', name: 'Equipo Oro', members: 5, prospects: 62, activeAdvisors: 4 },
        { id: '2', name: 'Equipo Plata', members: 3, prospects: 41, activeAdvisors: 3 },
        { id: '3', name: 'Equipo Norte', members: 4, prospects: 38, activeAdvisors: 2 },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Equipos de Venta</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Administra los equipos y consulta sus métricas de actividad.
                    </p>
                </div>
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                    Nuevo Equipo
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {teams.map((team) => (
                    <div key={team.id} className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{team.name}</h3>
                            <button className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">
                                Editar
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{team.members}</p>
                                <p className="text-xs text-gray-500 mt-1">Miembros</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{team.prospects}</p>
                                <p className="text-xs text-gray-500 mt-1">Prospectos</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{team.activeAdvisors}</p>
                                <p className="text-xs text-gray-500 mt-1">Activos Hoy</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t dark:border-gray-800 flex justify-between">
                            <button className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                Ver Prospectos
                            </button>
                            <button className="text-sm font-medium text-red-600 hover:text-red-800">
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
