'use server'

import { createClient } from '@/lib/supabase/server'
import { generateToken, hashToken, getTokenPrefix } from '@/lib/tokens'
import type { ApiToken } from '@/types'

export async function getApiTokens(): Promise<ApiToken[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('api_tokens')
    .select('id, user_id, name, token_prefix, last_used_at, expires_at, revoked_at, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function createApiToken(
  name: string
): Promise<{ token: string } | { error: string }> {
  if (!name || name.trim().length === 0) {
    return { error: 'El nombre del token es obligatorio' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const plainToken = generateToken()
  const hash = hashToken(plainToken)
  const prefix = getTokenPrefix(plainToken)

  const { error } = await supabase.from('api_tokens').insert({
    name: name.trim(),
    token_hash: hash,
    token_prefix: prefix,
  })

  if (error) return { error: 'Error al crear el token' }
  return { token: plainToken }
}

export async function revokeApiToken(
  tokenId: string
): Promise<{ success: boolean } | { error: string }> {
  if (!tokenId) return { error: 'ID de token no proporcionado' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('api_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', tokenId)
    .eq('user_id', user.id)

  if (error) return { error: 'Error al revocar el token' }
  return { success: true }
}
