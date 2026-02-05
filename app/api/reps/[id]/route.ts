import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

// GET a single rep
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('reps')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Rep not found' }, { status: 404 })
      }
      console.error('Error fetching rep:', error)
      return NextResponse.json({ error: 'Failed to fetch rep' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// UPDATE a rep
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      .update({ 
        first_name, 
        last_name, 
        email, 
        phone: phone || null, 
        agency: agency || null,
        channel 
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A rep with this email already exists' },
          { status: 409 }
        )
      }
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Rep not found' }, { status: 404 })
      }
      console.error('Error updating rep:', error)
      return NextResponse.json({ error: 'Failed to update rep' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE a rep
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('reps')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting rep:', error)
      return NextResponse.json({ error: 'Failed to delete rep' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
