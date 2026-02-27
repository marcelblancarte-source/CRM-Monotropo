import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

function StatCard({
    title, value, subtitle,
}: { title: string; value: string | number; subtitle?: string }) {
    return (
        <div className="rounded-none border border-white/10 bg-zinc-950 p-6 transition-all hover:border-white/20">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{title}</p>
            <p className="mt-3 text-3xl font-light tracking-tight text-white">{value}</p>
            {subtitle && <p className="mt-2 text-[10px] text-white/30 italic">{subtitle}</p>}
        </div>
    )
}

function TempBar({ label, emoji, count, total, colorClass }: { label: string; emoji: string; count: number; total: number; colorClass: string }) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0
    const monotropoColor = colorClass.includes('blue') ? 'bg-purple-600' : 
                          colorClass.includes('green') ? 'bg-white' : 
                          colorClass.includes('gray') ? 'bg-zinc-800' : 'bg-zinc-500';

    return (
        <div className="flex items-center gap-4">
            <div className="w-32 shrink-0 flex items-center gap-2 text-[11px] uppercase tracking-widest text-white/70">
                <span>{emoji}</span>
                <span>{label}</span>
            </div>
            <div className="flex-1 h-[2px] bg-white/5 overflow-hidden">
                <div className="h-full bg-white transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: monotropoColor === 'bg-purple-600' ? '#9333ea' : monotropoColor === 'bg-white' ? '#ffffff' : '#3f3f46' }} />
            </div>
            <span className="w-12 text-right text-[11px] font-mono text-white/50">{count}</span>
        </div>
    )
}

function FunnelStep({ step, label, count, pct, last }: { step: number; label: string; count: number; pct: number; last?: boolean }) {
    return (
        <div className="flex items-center gap-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/20 text-xs font-light text-white">
                0{step}
            </div>
            <div className="flex-1">
                <div className="flex justify-between text-[11px] uppercase tracking-[0.1em] mb-2 text-white/80">
                    <span>{label}</span>
                    <span className="font-mono text-white">{count} <span className="text-white/30">({pct}%)</span></span>
                </div>
                <div className="h-[1px] bg-white/10 w-full relative">
                    <div className="absolute top-0 left-0 h-full bg-purple-500" style={{ width: `${pct}%` }} />
                </div>
            </div>
            {!last && <div className="text-white/10 font-thin text-2xl">→</div>}
        </div>
    )
}

export default async function DashboardHomePage() {
    const supabase = await createClient()

    const totals = { prospects: 141, visited: 58, quoted: 32, closedImminent: 9 }
    const tempData = [
        { label: 'Cierre Inminente', emoji: '✧', count: 9, colorClass: 'bg-blue-500' },
        { label: 'Caliente', emoji: '●', count: 23, colorClass: 'bg-green-500' },
        { label: 'Medio', emoji: '○', count: 44, colorClass: 'bg-yellow-400' },
        { label: 'Tibio', emoji: '◌', count: 38, colorClass: 'bg-orange-400' },
        { label: 'Frío', emoji: '□', count: 27, colorClass: 'bg-gray-400' },
    ]
    const inventoryStats = { available: 89, held: 14, inProcess: 8, sold: 29 }
    const avgDiscount = 4.7 
    const todayActivities = { total: 14, overdue: 3, done: 7, pending: 4 }

    return (
        <div className="space-y-12 bg-black text-white min-h-screen pb-20">
            <div className="border-b border-white/10 pb-8">
                <h1 className="text-4xl font-extralight tracking-tighter uppercase">MTP Dashboard</h1>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mt-2">Inteligencia Estratégica Inmobiliaria</p>
            </div>

            <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10 lg:grid-cols-4">
                <StatCard title="Total Prospectos" value={totals.prospects} subtitle="Base de datos activa" />
                <StatCard title="Visitas" value={totals.visited} subtitle="Conversión presencial" />
                <StatCard title="Cotizaciones" value={totals.quoted} subtitle="Intención de compra" />
                <StatCard title="Cierres" value={totals.closedImminent} subtitle="Etapa final" />
            </div>

            <div className="grid gap-12 lg:grid-cols-3">
                <div className="lg:col-span-2 border border-white/10 bg-zinc-950 p-8">
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-10 text-white/50 border-b border-white/5 pb-4">Distribución de Temperatura</h2>
                    <div className="space-y-8">
                        {tempData.map((t) => (
                            <TempBar key={t.label} {...t} total={totals.prospects} />
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="border border-white/10 bg-zinc-950 p-8">
                        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-6 text-white/50">Actividades</h2>
                        <div className="flex justify-between items-end">
                            <p className="text-5xl font-light">{todayActivities.total}</p>
                            <div className="text-right space-y-1">
                                <p className="text-[9px] uppercase tracking-widest text-white/40">{todayActivities.done} Completadas</p>
                                <p className="text-[9px] uppercase tracking-widest text-purple-400">{todayActivities.overdue} Vencidas</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-purple-600 p-8">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">Descuento Promedio</p>
                        <p className="text-4xl font-light text-white mt-2">{avgDiscount}%</p>
                    </div>
                </div>
            </div>

            <div className="border border-white/10 bg-zinc-950 p-8">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-10 text-white/50">Embudo de Conversión</h2>
                <div className="space-y-10 max-w-3xl">
                    <FunnelStep step={1} label="Registros" count={141} pct={100} />
                    <FunnelStep step={2} label="Visitas" count={58} pct={41} />
                    <FunnelStep step={3} label="Cotizaciones" count={32} pct={23} />
                    <FunnelStep step={4} label="Cierre" count={9} pct={6} last />
                </div>
            </div>
        </div>
    )
}
