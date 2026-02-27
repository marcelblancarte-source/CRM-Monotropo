// ─── Roles ────────────────────────────────────────────────────────────────
export type RoleName = 'super_admin' | 'team_leader' | 'sales_advisor'

// ─── Temperature Semaphore ─────────────────────────────────────────────────
export type Temperature = 'Frío' | 'Tibio' | 'Medio' | 'Caliente' | 'Cierre Inminente'

export const TEMPERATURE_CONFIG: Record<Temperature, { icon: string; label: string; color: string; bg: string; darkBg: string; textColor: string }> = {
    'Frío': { icon: '🔴', label: 'Frío', color: 'text-gray-600', bg: 'bg-gray-100', darkBg: 'dark:bg-gray-800', textColor: 'dark:text-gray-300' },
    'Tibio': { icon: '🟠', label: 'Tibio', color: 'text-orange-700', bg: 'bg-orange-100', darkBg: 'dark:bg-orange-900/40', textColor: 'dark:text-orange-400' },
    'Medio': { icon: '🟡', label: 'Medio', color: 'text-yellow-700', bg: 'bg-yellow-100', darkBg: 'dark:bg-yellow-900/40', textColor: 'dark:text-yellow-400' },
    'Caliente': { icon: '🟢', label: 'Caliente', color: 'text-green-700', bg: 'bg-green-100', darkBg: 'dark:bg-green-900/40', textColor: 'dark:text-green-400' },
    'Cierre Inminente': { icon: '⭐', label: 'Cierre Inminente', color: 'text-blue-700', bg: 'bg-blue-100', darkBg: 'dark:bg-blue-900/40', textColor: 'dark:text-blue-400' },
}

// ─── Property Status ────────────────────────────────────────────────────────
export type PropertyStatus = 'Disponible' | 'Apartado' | 'En proceso' | 'Vendido'

// ─── Activity Types ─────────────────────────────────────────────────────────
export type ActivityType = 'Llamada telefónica' | 'Envío de información (WhatsApp/Correo)' | 'Visita al desarrollo' | 'Cita en oficina' | 'Seguimiento general'
export type ActivityStatus = 'Pendiente' | 'Realizada' | 'No contestó' | 'Reprogramada'

// ─── Lead Source ────────────────────────────────────────────────────────────
export type LeadSource = 'Referido' | 'Redes Sociales' | 'Portal Inmobiliario' | 'Espectacular' | 'Facebook/Instagram Ads' | 'Llamada directa' | 'Otro'

// ─── DB Row Types (mirrors Supabase tables) ─────────────────────────────────

export interface Team {
    id: string
    name: string
    created_at: string
}

export interface SysRole {
    id: string
    name: RoleName
    description: string
}

export interface UserProfile {
    id: string
    email: string
    full_name: string
    role_id: string
    team_id: string | null
    created_at: string
    updated_at: string
    sys_roles?: SysRole
    teams?: Team
}

export interface Property {
    id: string
    tower: string | null
    unit_number: string
    floor: string | null
    typology: string | null
    sqm_construction: number | null
    sqm_terrace: number | null
    list_price: number
    status: PropertyStatus
    description: string | null
    attachments: string[] | null
    created_at: string
    updated_at: string
}

export interface PaymentSchema {
    id: string
    name: string
    description: string | null
    down_payment_pct: number | null
    months: number | null
    term_notes: string | null
    created_at: string
    updated_at: string
}

export interface Prospect {
    id: string
    full_name: string
    phone: string | null
    email: string | null
    source: LeadSource | null
    first_contact_date: string
    advisor_id: string | null
    team_id: string | null
    temperature: Temperature
    visited: boolean
    visit_date: string | null
    visit_observations: string | null
    has_quote: boolean
    quote_date: string | null
    quoted_property_id: string | null
    list_price_at_quote: number | null
    offered_price: number | null
    payment_schema_id: string | null
    pref_typology: string | null
    pref_bedrooms: number | null
    pref_price_range: string | null
    pref_payment_schema: string | null
    created_at: string
    updated_at: string
    // Joins
    advisor?: UserProfile
    team?: Team
    quoted_property?: Property
    payment_schema?: PaymentSchema
}

export interface ProspectNote {
    id: string
    prospect_id: string
    user_id: string | null
    note: string
    created_at: string
    user?: UserProfile
}

export interface Activity {
    id: string
    prospect_id: string
    assigned_to: string | null
    type: ActivityType
    activity_date: string
    activity_time: string
    description: string | null
    status: ActivityStatus
    created_at: string
    updated_at: string
    prospect?: Prospect
    assigned_user?: UserProfile
}
