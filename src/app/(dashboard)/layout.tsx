import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function signOut() {
    'use server'
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { data: userData } = await supabase
        .from('users')
        .select('*, sys_roles(name), teams(name)')
        .eq('id', user.id)
        .single()

    const role: string = userData?.sys_roles?.name ?? 'sales_advisor'
    const isSuperAdmin = role === 'super_admin'
    const isLeader = role === 'team_leader'
    const isManager = isSuperAdmin || isLeader

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                {/* Logo */}
                <div className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-6 dark:border-gray-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-bold">C</div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">CRM Monotropo</span>
                </div>

                {/* User Card */}
                <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-sm dark:bg-blue-900/40 dark:text-blue-300">
                            {(userData?.full_name ?? user.email ?? 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                {userData?.full_name ?? 'Usuario'}
                            </p>
                            <p className="truncate text-xs text-gray-500 dark:text-gray-400 capitalize">
                                {role.replace(/_/g, ' ')}
                                {userData?.teams?.name ? ` · ${userData.teams.name}` : ''}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    <NavLink href="/dashboard" label="Dashboard" icon="chart" />
                    <NavLink href="/prospects" label="Prospectos" icon="users" />
                    <NavLink href="/activities" label="Agenda y Alertas" icon="calendar" />

                    {isManager && (
                        <>
                            <div className="pt-4 pb-1 px-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Administración</p>
                            </div>
                            {isSuperAdmin && <NavLink href="/inventory" label="Inventario" icon="building" />}
                            {isSuperAdmin && <NavLink href="/settings/payment-schemas" label="Esquemas de Pago" icon="creditcard" />}
                            {isSuperAdmin && <NavLink href="/settings/teams" label="Equipos" icon="team" />}
                            {isSuperAdmin && <NavLink href="/settings/users" label="Usuarios" icon="user" />}
                        </>
                    )}
                </nav>

                {/* Sign Out */}
                <div className="border-t border-gray-200 dark:border-gray-800 p-4">
                    <form action={signOut}>
                        <button
                            type="submit"
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                            Cerrar Sesión
                        </button>
                    </form>
                </div>
            </aside>

            {/* ── Page ──────────────────────────────────────────────────────── */}
            <main className="ml-64 flex-1 p-8 overflow-x-hidden">
                {children}
            </main>
        </div>
    )
}

// ─── NavLink helper ───────────────────────────────────────────────────────────
function NavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white transition-colors"
        >
            <NavIcon name={icon} />
            {label}
        </Link>
    )
}

function NavIcon({ name }: { name: string }) {
    const cls = "h-4 w-4 shrink-0"
    switch (name) {
        case 'chart':
            return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="18" y1="20" y2="10" /><line x1="12" x2="12" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="14" /></svg>
        case 'users':
            return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
        case 'calendar':
            return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
        case 'building':
            return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /><path d="M9 9v.01" /><path d="M9 12v.01" /><path d="M9 15v.01" /><path d="M9 18v.01" /></svg>
        case 'creditcard':
            return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
        case 'team':
            return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 2v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
        case 'user':
        default:
            return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
    }
}
