/**
 * InventoryService — Abstraction layer for property inventory.
 *
 * ARCHITECTURE NOTE:
 * This service is designed to be the single source of truth for inventory data.
 * Currently all reads/writes go to Supabase (local mode).
 *
 * PHASE 2 — Google Sheets Integration:
 * To connect a Google Sheet as the inventory source, implement `GoogleSheetsInventoryProvider`
 * and swap it in via the `source` parameter or environment variable.
 * The interface `InventoryProvider` must remain stable to avoid changes in callers.
 *
 * OAuth 2.0 flow for Google Sheets:
 * 1. Add Google OAuth credentials to .env.local (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET).
 * 2. Implement GoogleSheetsInventoryProvider.getAll() reading from the Sheet range.
 * 3. Implement GoogleSheetsInventoryProvider.update() writing back to the Sheet.
 * 4. Set INVENTORY_SOURCE=google_sheets in .env.local to activate.
 */

import type { Property } from '@/types'
import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Provider Interface ──────────────────────────────────────────────────────
export interface InventoryProvider {
    getAll(): Promise<Property[]>
    getById(id: string): Promise<Property | null>
    create(data: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<Property>
    update(id: string, data: Partial<Property>): Promise<Property>
    remove(id: string): Promise<void>
}

// ─── Supabase Provider (Phase 1 — Current) ──────────────────────────────────
export class SupabaseInventoryProvider implements InventoryProvider {
    constructor(private supabase: SupabaseClient) { }

    async getAll(): Promise<Property[]> {
        const { data, error } = await this.supabase
            .from('properties')
            .select('*')
            .order('tower', { ascending: true })
            .order('unit_number', { ascending: true })

        if (error) throw error
        return data as Property[]
    }

    async getById(id: string): Promise<Property | null> {
        const { data, error } = await this.supabase
            .from('properties')
            .select('*')
            .eq('id', id)
            .single()

        if (error) return null
        return data as Property
    }

    async create(payload: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<Property> {
        const { data, error } = await this.supabase
            .from('properties')
            .insert(payload)
            .select()
            .single()

        if (error) throw error
        return data as Property
    }

    async update(id: string, payload: Partial<Property>): Promise<Property> {
        const { data, error } = await this.supabase
            .from('properties')
            .update({ ...payload, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as Property
    }

    async remove(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('properties')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}

// ─── Google Sheets Provider Stub (Phase 2 — Future) ─────────────────────────
// Uncomment and implement when INVENTORY_SOURCE=google_sheets
// export class GoogleSheetsInventoryProvider implements InventoryProvider {
//   constructor(private accessToken: string, private spreadsheetId: string) {}
//   async getAll(): Promise<Property[]> { /* read from Sheets API */ return [] }
//   async getById(id: string): Promise<Property | null> { return null }
//   async create(data: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<Property> { throw new Error('Not implemented') }
//   async update(id: string, data: Partial<Property>): Promise<Property> { throw new Error('Not implemented') }
//   async remove(id: string): Promise<void> { throw new Error('Not implemented') }
// }

// ─── Factory ─────────────────────────────────────────────────────────────────
export function createInventoryService(supabase: SupabaseClient): InventoryProvider {
    const source = process.env.INVENTORY_SOURCE ?? 'supabase'

    switch (source) {
        case 'supabase':
        default:
            return new SupabaseInventoryProvider(supabase)
        // case 'google_sheets':
        //   return new GoogleSheetsInventoryProvider(process.env.GOOGLE_ACCESS_TOKEN!, process.env.GOOGLE_SHEETS_ID!)
    }
}
