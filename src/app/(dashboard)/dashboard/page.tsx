import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

// ─── Stat Card Component ─────────────────────────────────────────────────────
function StatCard({
    title, value, subtitle, color = 'text-gray-900',
}: { title: string; value: string | number; subtitle?: string; color?: string }) {
    return (
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className={`mt-2 text-3xl font-bold ${color} dark:text-white`}>{value}</p>
            {subtitle && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
    )
}

// ─── Temperature Bar Component ────────────────────────────────────────────────
function TempBar({ label, emoji, count, total, colorClass }: { label: string; emoji: string; count: number; total: number; colorClass: string }) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0
    return (
        <div className="flex items-center gap-3">
            <div className="w-32 shrink-0 flex items-center gap-1 text-sm font-medium">
                <span>{emoji}</span>
                <span>{label}</span>
            </div>
            <div className="flex-1 h-4 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div className={`h-full rounded-full ${colorClass} transition-all`} style={{ width: `${pct}%` }} />
            </div>
            <span className="w-12 text-right text-sm font-semibold tabular-nums">{count}</span>
        </div>
    )
}

// ─── Funnel Step Component ────────────────────────────────────────────────────
function FunnelStep({ step, label, count, pct, last }: { step: number; label: string; count: number; pct: number; last?: boolean }) {
    return (
        <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {step}
            </div>
            <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{label}</span>
                    <span className="tabular-nums font-semibold">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                </div>
            </div>
            {!last && <div className="text-gray-300 text-xl">↓</div>}
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function DashboardHomePage() {
    const supabase = await createClient()

    // MOCK — switch to real Supabase queries once DB is configured
    const totals = { prospects: 141, visited: 58, quoted: 32, closedImminent: 9 }
    const tempData = [
        { label: 'Cierre Inminente', emoji: '⭐', count: 9, colorClass: 'bg-blue-500' },
        { label: 'Caliente', emoji: '🟢', count: 23, colorClass: 'bg-green-500' },
        { label: 'Medio', emoji: '🟡', count: 44, colorClass: 'bg-yellow-400' },
        { label: 'Tibio', emoji: '🟠', count: 38, colorClass: 'bg-orange-400' },
        { label: 'Frío', emoji: '🔴', count: 27, colorClass: 'bg-gray-400' },
    ]
    const inventoryStats = { available: 89, held: 14, inProcess: 8, sold: 29 }
    const avgDiscount = 4.7 // %
    const todayActivities = { total: 14, overdue: 3, done: 7, pending: 4 }

    const teamSummary = [
        { name: 'Equipo Oro', prospects: 62, advisors: 4, hotLeads: 12 },
        { name: 'Equipo Plata', prospects: 41, advisors: 3, hotLeads: 7 },
        { name: 'Equipo Norte', prospects: 38, advisors: 4, hotLeads: 13 },
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Panel de Control General</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Vista ejecutiva — Todos los equipos y prospectos</p>
            </div>

            {/* ── KPIs Row ───────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard title="Total Prospectos" value={totals.prospects} subtitle="Activos en el sistema" />
                <StatCard title="Visitaron el Desarrollo" value={totals.visited} subtitle={`${Math.round((totals.visited / totals.prospects) * 100)}% del total`} color="text-blue-600" />
                <StatCard title="Con Cotización" value={totals.quoted} subtitle={`${Math.round((totals.quoted / totals.prospects) * 100)}% del total`} color="text-indigo-600" />
                <StatCard title="Cierre Inminente" value={totals.closedImminent} subtitle="Listos para apartar" color="text-green-600" />
            </div>

            {/* ── Second Row ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard title="Disponibles" value={inventoryStats.available} subtitle="Unidades en inventario" color="text-green-600" />
                <StatCard title="Apartados" value={inventoryStats.held} subtitle="Con enganche recibido" color="text-yellow-600" />
                <StatCard title="En Proceso" value={inventoryStats.inProcess} subtitle="Trámites en curso" color="text-orange-500" />
                <StatCard title="Vendidos" value={inventoryStats.sold} subtitle="Escriturados" color="text-gray-900" />
            </div>

            {/* ── Main Grid ──────────────────────────────────────────────────── */}
            <div className="grid gap-6 lg:grid-cols-3">

                {/* Semáforo de Temperatura */}
                <div className="lg:col-span-2 rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
                    <h2 className="text-lg font-semibold mb-4">Distribución por Temperatura</h2>
                    <div className="space-y-4">
                        {tempData.map((t) => (
                            <TempBar key={t.label} {...t} total={totals.prospects} />
                        ))}
                    </div>
                </div>

                {/* Actividades del Día */}
                <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
                    <h2 className="text-lg font-semibold mb-4">Actividades — Hoy</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
                            <div>
                                <p className="text-2xl font-bold">{todayActivities.total}</p>
                                <p className="text-xs text-gray-500">Total programadas</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-green-600">{todayActivities.done} Realizadas</p>
                                <p className="text-sm font-semibold text-yellow-600">{todayActivities.pending} Pendientes</p>
                                <p className="text-sm font-semibold text-red-600">{todayActivities.overdue} Vencidas</p>
                            </div>
                        </div>
                        {/* Descuento Promedio */}
                        <div className="rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800 p-4">
                            <p className="text-sm font-medium text-orange-700 dark:text-orange-400">Descuento Promedio Aplicado</p>
                            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">{avgDiscount}%</p>
                            <p className="text-xs text-orange-600/80 mt-1">Precio ofrecido vs. precio de lista</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Link href="/activities" className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                            Ver todas las actividades →
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Embudo de Conversión ────────────────────────────────────────── */}
            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
                <h2 className="text-lg font-semibold mb-6">Embudo de Conversión</h2>
                <div className="space-y-5 max-w-2xl">
                    <FunnelStep step={1} label="Prospectos Registrados" count={141} pct={100} />
                    <FunnelStep step={2} label="Visitaron el Desarrollo" count={58} pct={41} />
                    <FunnelStep step={3} label="Tienen Cotización" count={32} pct={23} />
                    <FunnelStep step={4} label="Cierre Inminente" count={9} pct={6} last />
                </div>
            </div>

            {/* ── Resumen por Equipo ──────────────────────────────────────────── */}
            <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Resumen por Equipo</h2>
                    <Link href="/settings/teams" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                        Gestionar equipos →
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b text-xs uppercase text-gray-500 dark:border-gray-800">
                            <tr>
                                <th className="py-3 pr-6 text-left font-medium">Equipo</th>
                                <th className="py-3 pr-6 text-right font-medium">Asesores</th>
                                <th className="py-3 pr-6 text-right font-medium">Prospectos</th>
                                <th className="py-3 pr-6 text-right font-medium">Caliente + Cierre</th>
                                <th className="py-3 text-right font-medium">% Conversión Caliente</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-800">
                            {teamSummary.map((team) => (
                                <tr key={team.name} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/30">
                                    <td className="py-3 pr-6 font-medium text-gray-900 dark:text-white">{team.name}</td>
                                    <td className="py-3 pr-6 text-right tabular-nums">{team.advisors}</td>
                                    <td className="py-3 pr-6 text-right tabular-nums">{team.prospects}</td>
                                    <td className="py-3 pr-6 text-right tabular-nums text-green-600 dark:text-green-400 font-semibold">{team.hotLeads}</td>
                                    <td className="py-3 text-right tabular-nums">
                                        {Math.round((team.hotLeads / team.prospects) * 100)}%
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
