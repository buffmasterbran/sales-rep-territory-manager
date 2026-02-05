import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'
import { logAudit } from '@/lib/audit'
import type { Channel } from '@/lib/types'

interface UploadRow {
  first_name: string
  last_name: string
  email: string
  phone?: string
  agency?: string
  channel: string
}

interface UploadResult {
  created: number
  updated: number
  errors: { row: number; message: string }[]
}

const VALID_CHANNELS = ['Golf', 'Promo', 'Gift']

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { rows } = body as { rows: UploadRow[] }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: 'No data rows provided' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get existing reps by email for update detection
    const { data: existingReps, error: fetchError } = await supabase
      .from('reps')
      .select('id, email')

    if (fetchError) {
      console.error('Error fetching existing reps:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch existing reps' }, { status: 500 })
    }

    // Build email -> id map (case-insensitive)
    const emailToId = new Map<string, string>()
    for (const rep of existingReps || []) {
      emailToId.set(rep.email.toLowerCase(), rep.id)
    }

    const result: UploadResult = {
      created: 0,
      updated: 0,
      errors: [],
    }

    const toInsert: any[] = []
    const toUpdate: { id: string; data: any }[] = []

    // Validate and categorize each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2 // +2 because row 1 is header, array is 0-indexed

      // Validate required fields
      if (!row.first_name?.trim()) {
        result.errors.push({ row: rowNum, message: 'Missing first_name' })
        continue
      }
      if (!row.last_name?.trim()) {
        result.errors.push({ row: rowNum, message: 'Missing last_name' })
        continue
      }
      if (!row.email?.trim()) {
        result.errors.push({ row: rowNum, message: 'Missing email' })
        continue
      }
      if (!row.channel?.trim()) {
        result.errors.push({ row: rowNum, message: 'Missing channel' })
        continue
      }

      // Validate email format (basic)
      const email = row.email.trim().toLowerCase()
      if (!email.includes('@')) {
        result.errors.push({ row: rowNum, message: `Invalid email: ${row.email}` })
        continue
      }

      // Validate channel
      const channel = row.channel.trim()
      if (!VALID_CHANNELS.includes(channel)) {
        result.errors.push({ row: rowNum, message: `Invalid channel: ${channel}. Must be Golf, Promo, or Gift.` })
        continue
      }

      const repData = {
        first_name: row.first_name.trim(),
        last_name: row.last_name.trim(),
        email: email,
        phone: row.phone?.trim() || null,
        agency: row.agency?.trim() || null,
        channel: channel as Channel,
      }

      // Check if rep exists
      const existingId = emailToId.get(email)
      if (existingId) {
        toUpdate.push({ id: existingId, data: repData })
      } else {
        toInsert.push(repData)
        // Add to map to detect duplicates in same upload
        emailToId.set(email, 'pending')
      }
    }

    // Perform inserts
    if (toInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('reps')
        .insert(toInsert)

      if (insertError) {
        console.error('Error inserting reps:', insertError)
        // Check for duplicate email error
        if (insertError.code === '23505') {
          result.errors.push({ row: 0, message: 'Duplicate email found in upload' })
        } else {
          return NextResponse.json({ error: 'Failed to create reps' }, { status: 500 })
        }
      } else {
        result.created = toInsert.length
      }
    }

    // Perform updates one by one (to handle individual errors)
    for (const { id, data } of toUpdate) {
      const { error: updateError } = await supabase
        .from('reps')
        .update(data)
        .eq('id', id)

      if (updateError) {
        console.error('Error updating rep:', updateError)
        result.errors.push({ row: 0, message: `Failed to update ${data.email}` })
      } else {
        result.updated++
      }
    }

    // Log the bulk upload
    if (result.created > 0 || result.updated > 0) {
      await logAudit(
        session,
        'bulk_upload',
        'reps',
        `Bulk upload: ${result.created} created, ${result.updated} updated, ${result.errors.length} errors`
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
