import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, password, fullName, roleId, teamId } = await request.json()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Verificar que las variables existen
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ 
      error: `Variables faltantes: URL=${!!supabaseUrl}, KEY=${!!serviceKey}` 
    }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message }, { status: 400 })
  }

  const { error: profileError } = await supabase.from('users').insert({
    id: authData.user.id,
    full_name: fullName,
    email,
    role_id: roleId || null,
    team_id: teamId || null,
  })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
