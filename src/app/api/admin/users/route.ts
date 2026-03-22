import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/users — List all users (admin only)
 * Joins auth.users with profiles to get full user info.
 */
export async function GET() {
  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await userSupabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createAdminClient()

  // Get all profiles
  const { data: profiles, error } = await admin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get auth users for email and metadata
  const { data: { users: authUsers }, error: authError } = await admin.auth.admin.listUsers()

  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

  // Merge auth data with profiles
  const users = (profiles || []).map(p => {
    const authUser = authUsers.find(u => u.id === p.id)
    return {
      ...p,
      email: authUser?.email || '',
      email_confirmed: !!authUser?.email_confirmed_at,
      last_sign_in: authUser?.last_sign_in_at || null,
      created_at_auth: authUser?.created_at || p.created_at,
    }
  })

  return NextResponse.json({ users })
}

/**
 * PATCH /api/admin/users — Update a user's role/admin status
 */
export async function PATCH(request: NextRequest) {
  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await userSupabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { userId, is_admin } = body

  if (!userId || typeof is_admin !== 'boolean') {
    return NextResponse.json({ error: 'Missing userId or is_admin' }, { status: 400 })
  }

  // Prevent removing own admin
  if (userId === user.id && !is_admin) {
    return NextResponse.json({ error: 'No puedes quitarte el rol de admin a ti mismo' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ is_admin })
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
