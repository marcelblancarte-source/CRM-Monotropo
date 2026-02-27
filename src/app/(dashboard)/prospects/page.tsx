import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ProspectsPage() {
    const supabase = await createClient()

    // MOCK DATA PARA FRONTEND
    const prospects = [
        { id: '1', full_name: 'Roberto Gómez', phone: '555-123-4567', email: 'roberto@email.com', temperature: 'Caliente', advisor: 'Ana Ramírez', last_contact: '2023-11-20' },
        { id: '2', full_name: 'Silvia Leticia', phone: '555-987-6543', email: 'silvia@email.com', temperature: 'Medio', advisor: 'Carlos Pérez', last_contact: '2023-11-18' },
        { id: '3', full_name: 'Mauricio Paz', phone: '555-456-7890', email: 'mauricio@email.com', temperature: 'Frío', advisor: 'Ana Ramírez', last_contact: '2023-11-05' },
        { id: '4', full_name: 'Fernanda Ríos', phone: '555-222-3333', email: 'fernanda@email.com', temperature: 'Cierre Inminente', advisor: 'Carlos Pérez', last_contact: '2023-11-21' },
        { id: '5', full_name: 'Andrés Gil', phone: '555-888-9999', email: 'andres@email.com', temperature: 'Tibio', advisor: 'Ana Ramírez', last_contact: '2023-11-15' },
    ]

    const getTemperatureBadge = (temp: string) => {
        switch (temp) {
            case 'Frío': return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-300">🔴 Frío</span>
            case 'Tibio': return <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900/40 dark:text-orange-400">🟠 Tibio</span>
            case 'Medio': return <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400">🟡 Medio</span>
            case 'Caliente': return <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-400">🟢 Caliente</span>
            case 'Cierre Inminente': return <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-400">⭐ Cierre Inminente</span>
            default: return <span>{temp}</span>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Directorio de Prospectos</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Gestiona el seguimiento y embudo de ventas de tus leads.
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Botón para registrar nuevo prospecto */}
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>
                        Nuevo Prospecto
                    </button>
                </div>
            </div>

            {/* Acciones Rápidas (Filtros, Buscador) */}
            <div className="flex w-full items-center space-x-2">
                <input
                    type="text"
                    placeholder="Buscar por nombre, correo o teléfono..."
                    className="flex h-10 w-full md:w-1/3 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <select className="flex h-10 w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Todas las Temperaturas</option>
                    <option value="frio">🔴 Frío</option>
                    <option value="tibio">🟠 Tibio</option>
                    <option value="medio">🟡 Medio</option>
                    <option value="caliente">🟢 Caliente</option>
                    <option value="cierre">⭐ Cierre Inminente</option>
                </select>
            </div>

            {/* Listado */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {prospects.map((prospect) => (
                    <div key={prospect.id} className="relative flex flex-col rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 transition">
                        <div className="flex justify-between items-start mb-2">
                            <Link href={`/prospects/${prospect.id}`} className="text-lg font-bold text-blue-600 hover:underline dark:text-blue-400">
                                {prospect.full_name}
                            </Link>
                            {getTemperatureBadge(prospect.temperature)}
                        </div>

                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 space-y-1">
                            <p className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
                                {prospect.phone}
                            </p>
                            <p className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                {prospect.email}
                            </p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
                            <span className="text-gray-500 font-medium">Asesor: {prospect.advisor}</span>
                            <span className="text-gray-400">Últ. contacto: {prospect.last_contact}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
