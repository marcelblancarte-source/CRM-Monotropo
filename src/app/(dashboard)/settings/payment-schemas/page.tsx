import { createClient } from '@/lib/supabase/server'

export default async function PaymentSchemasPage() {
    const supabase = await createClient()

    // MOCK DATA
    const schemas = [
        { id: '1', name: 'Contado', description: 'Pago 100% a la firma del contrato. Mayor descuento.', down_payment_pct: 100, months: 0, term_notes: 'Descuento aplicable según políticas vigentes.' },
        { id: '2', name: 'Crédito Hipotecario', description: 'Pago inicial con recursos propios, saldo con banco.', down_payment_pct: 10, months: 0, term_notes: 'Aceptamos INFONAVIT, FOVISSSTE y bancarios.' },
        { id: '3', name: 'Financiamiento Directo', description: 'Enganche y saldo diferido durante la obra.', down_payment_pct: 30, months: 24, term_notes: 'Mensualidades sin intereses. Consulta términos.' },
        { id: '4', name: 'Mixto', description: 'Esquema personalizado para cada cliente.', down_payment_pct: 20, months: 12, term_notes: 'Saldo 80% escrituración mixta.' },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Políticas de Pago</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Administra los distintos esquemas que los asesores pueden ofrecer a los prospectos.
                    </p>
                </div>
                <div>
                    {/* Botón Nuevo Esquema */}
                    <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                        Nuevo Esquema
                    </button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {schemas.map((schema) => (
                    <div key={schema.id} className="relative flex flex-col rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{schema.name}</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{schema.description}</p>
                        </div>

                        <div className="mb-6 flex-1 space-y-3">
                            <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                                <span className="text-sm text-gray-500">Enganche Min.</span>
                                <span className="text-sm font-medium">{schema.down_payment_pct}%</span>
                            </div>
                            <div className="flex justify-between border-b pb-2 dark:border-gray-800">
                                <span className="text-sm text-gray-500">Meses (Plazo)</span>
                                <span className="text-sm font-medium">{schema.months || 'N/A'} meses</span>
                            </div>
                            <div className="pt-2">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Notas</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                                    {schema.term_notes}
                                </p>
                            </div>
                        </div>

                        <div className="mt-auto flex justify-end space-x-2 pt-4 border-t dark:border-gray-800">
                            <button className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-1">
                                Editar
                            </button>
                            <button className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors px-3 py-1">
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
