import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'
import { validateZipCode } from '@/lib/utils'
import type { Channel } from '@/lib/types'

const VALID_CHANNELS = ['Golf', 'Promo', 'Gift']

// DELETE an assignment (by zip_code + channel)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const zip_code = searchParams.get('zip_code')
    const channel = searchParams.get('channel')

    if (!zip_code || !channel) {
      return NextResponse.json(
        { error: 'zip_code and channel are required' },
        { status: 400 }
      )
    }

    if (!validateZipCode(zip_code)) {
      return NextResponse.json(
        { error: 'Invalid zip code format' },
        { status: 400 }
      )
    }

    if (!VALID_CHANNELS.includes(channel)) {
      return NextResponse.json(
        { error: 'Invalid channel. Must be Golf, Promo, or Gift.' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('zip_code', zip_code)
      .eq('channel', channel)

    if (error) {
      console.error('Error deleting assignment:', error)
      return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Create or update a single assignment (reassign)
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { zip_code, channel, rep_id } = body

    if (!zip_code || !channel || !rep_id) {
      return NextResponse.json(
        { error: 'zip_code, channel, and rep_id are required' },
        { status: 400 }
      )
    }

    if (!validateZipCode(zip_code)) {
      return NextResponse.json(
        { error: 'Invalid zip code format' },
        { status: 400 }
      )
    }

    if (!VALID_CHANNELS.includes(channel)) {
      return NextResponse.json(
        { error: 'Invalid channel. Must be Golf, Promo, or Gift.' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Verify the rep exists and belongs to this channel
    const { data: rep, error: repError } = await supabase
      .from('reps')
      .select('id, channel')
      .eq('id', rep_id)
      .single()

    if (repError || !rep) {
      return NextResponse.json({ error: 'Rep not found' }, { status: 404 })
    }

    if (rep.channel !== channel) {
      return NextResponse.json(
        { error: `Rep is assigned to ${rep.channel} channel, not ${channel}` },
        { status: 400 }
      )
    }

    // Upsert the assignment
    const { data, error } = await supabase
      .from('assignments')
      .upsert(
        { zip_code, channel, rep_id },
        { onConflict: 'zip_code,channel' }
      )
      .select()
      .single()

    if (error) {
      console.error('Error upserting assignment:', error)
      return NextResponse.json({ error: 'Failed to save assignment' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
