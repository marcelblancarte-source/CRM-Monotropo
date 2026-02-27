import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function InventoryPage() {
    const supabase = await createClient()

    // MOCK DATA PARA FRONTEND
    const properties = [
        { id: '1', tower: 'Torre A', unit_number: '101', floor: '1', typology: '2 Recámaras', sqm_construction: 90, list_price: 2500000, status: 'Disponible' },
        { id: '2', tower: 'Torre A', unit_number: '102', floor: '1', typology: '3 Recámaras', sqm_construction: 110, list_price: 3100000, status: 'Apartado' },
        { id: '3', tower: 'Torre B', unit_number: 'PH-1', floor: '8', typology: 'Penthouse', sqm_construction: 180, list_price: 5800000, status: 'Disponible' },
        { id: '4', tower: 'Torre B', unit_number: '204', floor: '2', typology: 'Estudio', sqm_construction: 65, list_price: 1800000, status: 'Vendido' },
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Disponible': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            case 'Apartado': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
            case 'Vendido': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inventario de Unidades</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Gestiona las propiedades del desarrollo y su disponibilidad.
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Botón para registrar nueva unidad */}
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                        Nueva Unidad
                    </button>
                </div>
            </div>

            <div className="rounded-md border bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="border-b bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-4 font-medium">Unidad</th>
                                <th className="px-6 py-4 font-medium">Torre / Nivel</th>
                                <th className="px-6 py-4 font-medium">Tipología</th>
                                <th className="px-6 py-4 font-medium">Área</th>
                                <th className="px-6 py-4 font-medium">Precio de Lista</th>
                                <th className="px-6 py-4 font-medium">Estatus</th>
                                <th className="px-6 py-4 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {properties.map((prop) => (
                                <tr key={prop.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {prop.unit_number}
                                    </td>
                                    <td className="px-6 py-4">
                                        {prop.tower} - Nivel {prop.floor}
                                    </td>
                                    <td className="px-6 py-4">{prop.typology}</td>
                                    <td className="px-6 py-4">{prop.sqm_construction} m²</td>
                                    <td className="px-6 py-4 font-medium">
                                        ${prop.list_price.toLocaleString('es-MX')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(prop.status)}`}>
                                            {prop.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                                            Editar
                                        </button>
                                        <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                                            Detalles
                                        </button>
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
