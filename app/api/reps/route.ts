import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'
import { logAudit } from '@/lib/audit'
import type { Rep } from '@/lib/types'

// GET all reps
export async function GET() {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('reps')
      .select('*')
      .order('last_name')
      .order('first_name')

    if (error) {
      console.error('Error fetching reps:', error)
      return NextResponse.json({ error: 'Failed to fetch reps' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// CREATE a new rep
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { first_name, last_name, email, phone, agency, channel } = body

    if (!first_name || !last_name || !email || !channel) {
      return NextResponse.json(
        { error: 'First name, last name, email, and channel are required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('reps')
      .insert({ 
        first_name, 
        last_name, 
        email, 
        phone: phone || null, 
        agency: agency || null,
        channel 
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A rep with this email already exists' },
          { status: 409 }
        )
      }
      console.error('Error creating rep:', error)
      return NextResponse.json({ error: 'Failed to create rep' }, { status: 500 })
    }

    // Log the creation
    await logAudit(
      session,
      'create',
      'reps',
      `Created rep: ${first_name} ${last_name} (${email}) - ${channel}`,
      data.id
    )

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
