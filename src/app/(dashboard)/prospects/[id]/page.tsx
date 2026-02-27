import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ProspectDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    // Mock validation
    if (!id) return notFound()

    // MOCK DATA
    const prospect = {
        id,
        full_name: 'Roberto Gómez',
        phone: '555-123-4567',
        email: 'roberto@email.com',
        source: 'Instagram Ad',
        temperature: 'Caliente',
        advisor: 'Ana Ramírez',
        team: 'Equipo Oro',
        first_contact: '2023-11-20',
        visit: {
            visited: true,
            date: '2023-11-25',
            observations: 'Le gustó mucho la terraza y las amenidades. Viene con su esposa.',
        },
        quote: {
            has_quote: true,
            date: '2023-11-25',
            unit: 'Torre A - 402',
            list_price: 3200000,
            offered_price: 3050000, // Demostración de descuento
            schema: 'Financiamiento Directo',
        },
        preferences: {
            typology: '2 Recámaras',
            budget: '$2.5M - $3.5M',
        }
    }

    const notes = [
        { id: 1, date: '25 Nov 2023 16:30', user: 'Ana Ramírez', text: 'Se le envió la cotización ajustada por correo. Quedó de revisarla con el banco.' },
        { id: 2, date: '25 Nov 2023 11:00', user: 'Ana Ramírez', text: 'Realizó visita al showroom. Mostró alto interés en unidades con terraza.' },
        { id: 3, date: '20 Nov 2023 09:15', user: 'Ana Ramírez', text: 'Primer contacto vía anuncio de Instagram. Se agendó visita para el sábado.' },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/prospects" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="m15 18-6-6 6-6" /></svg>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{prospect.full_name}</h1>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-400">
                            🟢 {prospect.temperature}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>Asesor: {prospect.advisor} ({prospect.team})</span>
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Columna Izquierda: Info Principal */}
                <div className="md:col-span-2 space-y-6">
                    {/* Tarjeta de Información de Contacto y Origen */}
                    <div className="rounded-xl border bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800">
                        <div className="border-b px-6 py-4 dark:border-gray-800">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Información del Prospecto</h3>
                        </div>
                        <div className="p-6 grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Teléfono</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{prospect.phone}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Correo Electrónico</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{prospect.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Origen</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{prospect.source}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Fecha 1er Contacto</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{prospect.first_contact}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Preferencias</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{prospect.preferences.typology} | {prospect.preferences.budget}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta de Cotización y Visita */}
                    <div className="rounded-xl border bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800 grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x dark:divide-gray-800">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Visita al Desarrollo</h3>
                                {prospect.visit.visited && (
                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-400">Realizada</span>
                                )}
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Fecha de Visita</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{prospect.visit.date}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Observaciones</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{prospect.visit.observations}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Cotización Activa</h3>
                                {prospect.quote.has_quote && (
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-400">Vigente</span>
                                )}
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Unidad Cotizada</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{prospect.quote.unit} ({prospect.quote.date})</p>
                                </div>
                                <div className="flex gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Precio Lista</p>
                                        <p className="text-sm text-gray-500 line-through">${prospect.quote.list_price.toLocaleString('es-MX')}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Precio Ofrecido</p>
                                        <p className="font-bold text-green-600 dark:text-green-400">${prospect.quote.offered_price.toLocaleString('es-MX')}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Esquema</p>
                                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{prospect.quote.schema}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Bitácora Inmutable */}
                <div className="md:col-span-1 border-l pl-0 md:pl-6 dark:border-gray-800">
                    <h3 className="text-lg font-bold mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" /></svg>
                        Bitácora de Seguimiento
                    </h3>

                    {/* Formulario Nueva Nota */}
                    <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50 border dark:border-gray-800">
                        <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Agregar Nota (Inmutable)</label>
                        <textarea
                            id="note"
                            rows={3}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-700 dark:focus:ring-blue-500 p-2"
                            placeholder="Escribe los detalles de la interacción..."
                        ></textarea>
                        <button className="mt-3 w-full inline-flex justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                            Guardar Nota
                        </button>
                    </div>

                    {/* Historial Timeline */}
                    <div className="flow-root">
                        <ul role="list" className="-mb-8">
                            {notes.map((note, noteIdx) => (
                                <li key={note.id}>
                                    <div className="relative pb-8">
                                        {noteIdx !== notes.length - 1 ? (
                                            <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-800" aria-hidden="true" />
                                        ) : null}
                                        <div className="relative flex space-x-3">
                                            <div>
                                                <span className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center ring-8 ring-white dark:ring-gray-950">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
                                                </span>
                                            </div>
                                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {note.text}
                                                    </p>
                                                    <p className="mt-1 text-xs font-medium text-gray-900 dark:text-gray-300">
                                                        {note.user} — {note.date}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    )
}
