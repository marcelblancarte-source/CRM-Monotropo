import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ActivitiesPage() {
    const supabase = await createClient()

    // MOCK DATA PARA DEMOSTRACIÓN DEL ESPACIO MIENTRAS SE CONECTA A DB
    const summary = {
        pending: 12,
        completed: 45,
        overdue: 3,
        noActivity7Days: 8 // Prospectos sin actividad programada en los últimos 7 días
    }

    const activities = [
        { id: '1', type: 'Llamada telefónica', prospect: 'Roberto Gómez', description: 'Confirmar recepción de cotización enviada', date: '2023-11-26', time: '10:00', status: 'Pendiente', isOverdue: false, advisor: 'Ana Ramírez' },
        { id: '2', type: 'Visita al desarrollo', prospect: 'Silvia Leticia', description: 'Visita programada a torre de amenidades', date: '2023-11-26', time: '16:30', status: 'Pendiente', isOverdue: false, advisor: 'Carlos Pérez' },
        { id: '3', type: 'Cita en oficina', prospect: 'Mauricio Paz', description: 'Firma de apartado', date: '2023-11-24', time: '11:00', status: 'Pendiente', isOverdue: true, advisor: 'Ana Ramírez' },
        { id: '4', type: 'Envío de información', prospect: 'Fernanda Ríos', description: 'Enviar planos de PB y precios actualizados', date: '2023-11-25', time: '18:00', status: 'Realizada', isOverdue: false, advisor: 'Carlos Pérez' },
    ]

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'Llamada telefónica': return '📞'
            case 'Envío de información': return '✉️'
            case 'Visita al desarrollo': return '🏗️'
            case 'Cita en oficina': return '🏢'
            default: return '📅'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Agenda y Alertas</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Monitor de actividades de seguimiento por asesor y equipo.
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Botón para registrar nueva actividad */}
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
                        Agendar Actividad
                    </button>
                </div>
            </div>

            {/* Indicadores Resumen Arriba */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800 flex flex-col items-center justify-center text-center">
                    <h3 className="text-sm font-medium tracking-tight text-gray-500 mb-2">Pendientes Totales</h3>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{summary.pending}</div>
                </div>
                <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800 flex flex-col items-center justify-center text-center ring-1 ring-red-500/20 bg-red-50/50 dark:bg-red-900/10">
                    <h3 className="text-sm font-medium tracking-tight text-red-600 dark:text-red-400 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                        Actividades Vencidas
                    </h3>
                    <div className="text-3xl font-bold text-red-600 dark:text-red-500">{summary.overdue}</div>
                </div>
                <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800 flex flex-col items-center justify-center text-center">
                    <h3 className="text-sm font-medium tracking-tight text-gray-500 mb-2">Realizadas Totales</h3>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{summary.completed}</div>
                </div>
                <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800 flex flex-col items-center justify-center text-center ring-1 ring-orange-500/20 bg-orange-50/50 dark:bg-orange-900/10">
                    <h3 className="text-sm font-medium tracking-tight text-orange-600 dark:text-orange-400 mb-2 text-center">
                        Prospectos sin contacto (&gt;7d)
                    </h3>
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-500">{summary.noActivity7Days}</div>
                </div>
            </div>

            <div className="rounded-md border bg-white dark:border-gray-800 dark:bg-gray-900">
                {/* Table/List view of activities */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="border-b bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-4 font-medium">Actividad</th>
                                <th className="px-6 py-4 font-medium">Prospecto</th>
                                <th className="px-6 py-4 font-medium">Asesor</th>
                                <th className="px-6 py-4 font-medium">Fecha y Hora</th>
                                <th className="px-6 py-4 font-medium">Estatus</th>
                                <th className="px-6 py-4 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {activities.map((activity) => (
                                <tr key={activity.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${activity.isOverdue ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 dark:text-white flex items-center">
                                            <span className="mr-2">{getActivityIcon(activity.type)}</span>
                                            {activity.type}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1 max-w-md truncate">{activity.description}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400">
                                        <Link href={`/prospects`}>{activity.prospect}</Link>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{activity.advisor}</td>
                                    <td className="px-6 py-4">
                                        <span className={`font-medium ${activity.isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                                            {activity.date} — {activity.time}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {activity.isOverdue ? (
                                            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-900/40 dark:text-red-400">
                                                Vencida
                                            </span>
                                        ) : (
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${activity.status === 'Realizada' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                                                {activity.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {activity.status === 'Pendiente' && (
                                            <button className="text-sm font-medium text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                                Completar
                                            </button>
                                        )}
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
