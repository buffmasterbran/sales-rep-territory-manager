import { createAdminClient } from '@/lib/supabase/server'
import type { SessionData } from '@/lib/session'

export type AuditAction = 'create' | 'update' | 'delete' | 'bulk_upload'
export type AuditTable = 'reps' | 'assignments'

interface AuditLogEntry {
  user_id: string
  username: string
  user_full_name: string
  action: AuditAction
  table_name: AuditTable
  record_id?: string
  description: string
}

/**
 * Log an action to the audit_log table
 * Non-blocking - errors are logged but don't affect the main operation
 */
export async function logAudit(
  session: SessionData,
  action: AuditAction,
  tableName: AuditTable,
  description: string,
  recordId?: string
): Promise<void> {
  try {
    const supabase = createAdminClient()
    
    const entry: AuditLogEntry = {
      user_id: session.userId,
      username: session.username,
      user_full_name: session.fullName,
      action,
      table_name: tableName,
      record_id: recordId,
      description,
    }

    const { error } = await supabase
      .from('audit_log')
      .insert(entry)

    if (error) {
      // Log error but don't throw - audit logging shouldn't break the main operation
      console.error('Failed to write audit log:', error)
    }
  } catch (error) {
    console.error('Audit logging error:', error)
  }
}
