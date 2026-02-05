import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'
import { validateZipCode } from '@/lib/utils'
import type { Channel, UploadResult } from '@/lib/types'

interface UploadRow {
  zip: string
  rep_email: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { channel, rows } = body as { channel: Channel; rows: UploadRow[] }

    if (!channel || !['Golf', 'Promo', 'Gift'].includes(channel)) {
      return NextResponse.json(
        { error: 'Invalid channel. Must be Golf, Promo, or Gift.' },
        { status: 400 }
      )
    }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: 'No data rows provided' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get all reps to build email -> id lookup
    const { data: reps, error: repsError } = await supabase
      .from('reps')
      .select('id, email')

    if (repsError) {
      console.error('Error fetching reps:', repsError)
      return NextResponse.json({ error: 'Failed to fetch reps' }, { status: 500 })
    }

    // Build email -> id map (case-insensitive)
    const emailToRepId = new Map<string, string>()
    for (const rep of reps || []) {
      emailToRepId.set(rep.email.toLowerCase(), rep.id)
    }

    const result: UploadResult = {
      success: 0,
      errors: [],
    }

    const validAssignments: { zip_code: string; channel: Channel; rep_id: string }[] = []

    // Validate each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2 // +2 because row 1 is header, array is 0-indexed

      // Check for required fields
      if (!row.zip || !row.rep_email) {
        result.errors.push({
          row: rowNum,
          message: `Missing required fields (zip: ${row.zip || 'missing'}, rep_email: ${row.rep_email || 'missing'})`,
        })
        continue
      }

      // Validate zip code
      const zip = row.zip.toString().trim()
      if (!validateZipCode(zip)) {
        result.errors.push({
          row: rowNum,
          message: `Invalid zip code format "${zip}" (must be 5 digits)`,
        })
        continue
      }

      // Look up rep by email
      const email = row.rep_email.toString().trim().toLowerCase()
      const repId = emailToRepId.get(email)

      if (!repId) {
        result.errors.push({
          row: rowNum,
          message: `Rep not found with email "${row.rep_email}"`,
        })
        continue
      }

      // Valid row - add to batch
      validAssignments.push({
        zip_code: zip,
        channel,
        rep_id: repId,
      })
    }

    // Bulk upsert valid assignments
    if (validAssignments.length > 0) {
      const { error: upsertError } = await supabase
        .from('assignments')
        .upsert(validAssignments, {
          onConflict: 'zip_code,channel',
          ignoreDuplicates: false,
        })

      if (upsertError) {
        console.error('Error upserting assignments:', upsertError)
        return NextResponse.json(
          { error: 'Failed to save assignments' },
          { status: 500 }
        )
      }

      result.success = validAssignments.length
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
