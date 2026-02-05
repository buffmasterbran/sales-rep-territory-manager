import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { validateZipCode } from '@/lib/utils'
import type { GetRepsResponse, Channel, Rep } from '@/lib/types'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const zip = searchParams.get('zip')

  // Validate zip parameter
  if (!zip) {
    return NextResponse.json(
      { error: 'Missing required parameter: zip' },
      { status: 400 }
    )
  }

  if (!validateZipCode(zip)) {
    return NextResponse.json(
      { error: 'Invalid zip code format. Must be 5 digits.' },
      { status: 400 }
    )
  }

  try {
    const supabase = createAdminClient()

    // Query assignments for this zip code with rep details
    const { data: assignments, error } = await supabase
      .from('assignments')
      .select(`
        id,
        zip_code,
        channel,
        rep_id,
        reps (
          id,
          name,
          email,
          phone,
          channel
        )
      `)
      .eq('zip_code', zip)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    // Build response object with all channels
    const response: GetRepsResponse = {
      zip,
      reps: {
        Golf: null,
        Promo: null,
        Gift: null,
      },
    }

    // Populate reps for each channel
    if (assignments) {
      for (const assignment of assignments) {
        const channel = assignment.channel as Channel
        const rep = assignment.reps as unknown as Rep
        if (rep && channel in response.reps) {
          response.reps[channel] = rep
        }
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
