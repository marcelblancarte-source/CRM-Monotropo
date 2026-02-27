import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string }>
}) {
    const { message } = await searchParams

    const signIn = async (formData: FormData) => {
        'use server'
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const { createClient } = await import('@/lib/supabase/server')
        const supabase = await createClient()
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) return redirect('/login?message=' + encodeURIComponent(error.message))
        return redirect('/dashboard')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4">
            {/* Background circles decoration */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
                <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
            </div>

            <div className="relative w-full max-w-sm">
                {/* Logo / Brand */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white text-2xl font-bold shadow-lg shadow-blue-600/30">
                        C
                    </div>
                    <h1 className="text-2xl font-bold text-white">CRM Monotropo</h1>
                    <p className="mt-1 text-sm text-blue-300/80">Gestión Estratégica</p>
                </div>

                {/* Card */}
                <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl p-8">
                    {message && (
                        <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/40 px-4 py-3 text-sm text-red-200">
                            {message}
                        </div>
                    )}

                    <form action={signIn} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-blue-200 mb-2">
                                Correo Electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="tu@empresa.com"
                                className="block w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-blue-300/60 backdrop-blur-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-blue-200 mb-2">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                placeholder="••••••••"
                                className="block w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-blue-300/60 backdrop-blur-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/40 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all active:scale-[0.98]"
                        >
                            Iniciar Sesión
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-xs text-blue-400/60">
                    Acceso exclusivo para usuarios autorizados.
                </p>
            </div>
        </div>
    )
}
