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
        const supabase = await createClient()
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) return redirect('/login?message=' + encodeURIComponent(error.message))
        return redirect('/dashboard')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-4">
            <div className="relative w-full max-w-sm">
                {/* Logo / Brand */}
                <div className="mb-12 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-white/20 bg-white/5 text-white text-3xl font-light tracking-tighter">
                        M
                    </div>
                    <h1 className="text-2xl font-light tracking-[0.2em] text-white uppercase">Monotropo</h1>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-white/40">Gestión Estratégica</p>
                </div>

                {/* Card */}
                <div className="border border-white/10 bg-white/[0.02] p-8">
                    {message && (
                        <div className="mb-6 border border-white/20 bg-white/5 px-4 py-3 text-xs text-white/60">
                            {message}
                        </div>
                    )}

                    <form action={signIn} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-[10px] font-medium uppercase tracking-[0.2em] text-white/50 mb-3">
                                Correo Electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="usuario@monotropo.mx"
                                className="block w-full border border-white/10 bg-transparent px-4 py-3 text-sm text-white placeholder-white/20 focus:border-white/40 focus:outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-[10px] font-medium uppercase tracking-[0.2em] text-white/50 mb-3">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                placeholder="••••••••"
                                className="block w-full border border-white/10 bg-transparent px-4 py-3 text-sm text-white placeholder-white/20 focus:border-white/40 focus:outline-none transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-white py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-black hover:bg-white/90 transition-all active:scale-[0.98]"
                        >
                            Iniciar Sesión
                        </button>
                    </form>
                </div>

                <p className="mt-10 text-center text-[9px] uppercase tracking-[0.2em] text-white/20">
                    Acceso Restringido
                </p>
            </div>
        </div>
    )
}
