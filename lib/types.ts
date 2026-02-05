export type Channel = 'Golf' | 'Outdoor' | 'Gift'

export const CHANNELS: Channel[] = ['Golf', 'Outdoor', 'Gift']

export interface Rep {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  agency: string | null
  channel: Channel
  created_at: string
}

// Helper to get full name
export function getRepFullName(rep: Rep): string {
  return `${rep.first_name} ${rep.last_name}`.trim()
}

// Helper to get display name (with agency if present)
export function getRepDisplayName(rep: Rep): string {
  const fullName = getRepFullName(rep)
  return rep.agency ? `${fullName} (${rep.agency})` : fullName
}

export interface Assignment {
  id: string
  zip_code: string
  channel: Channel
  rep_id: string
  created_at: string
}

export interface AssignmentWithRep extends Assignment {
  reps: Rep
}

export interface GetRepsResponse {
  zip: string
  reps: {
    Golf: Rep | null
    Outdoor: Rep | null
    Gift: Rep | null
  }
}

export interface CSVRow {
  zip: string
  rep_email: string
}

export interface UploadResult {
  success: number
  errors: { row: number; message: string }[]
}
