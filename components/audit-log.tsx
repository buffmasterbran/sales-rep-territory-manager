"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"

interface AuditEntry {
  id: string
  user_id: string
  username: string
  user_full_name: string
  action: 'create' | 'update' | 'delete' | 'bulk_upload'
  table_name: 'reps' | 'assignments'
  record_id: string | null
  description: string
  created_at: string
}

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-100 text-green-800',
  update: 'bg-blue-100 text-blue-800',
  delete: 'bg-red-100 text-red-800',
  bulk_upload: 'bg-purple-100 text-purple-800',
}

const TABLE_LABELS: Record<string, string> = {
  reps: 'Reps',
  assignments: 'Assignments',
}

export function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [offset, setOffset] = useState(0)
  const limit = 20

  const fetchAuditLog = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/audit-log?limit=${limit}&offset=${offset}`)
      if (response.ok) {
        const data = await response.json()
        setEntries(data.data || [])
        setTotal(data.total || 0)
      }
    } catch (error) {
      console.error("Error fetching audit log:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAuditLog()
  }, [offset])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const currentPage = Math.floor(offset / limit) + 1
  const totalPages = Math.ceil(total / limit)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Change History</CardTitle>
            <CardDescription>
              Track who made changes and what was updated
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAuditLog}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No changes have been logged yet.
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]">When</TableHead>
                    <TableHead className="w-[140px]">Who</TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                    <TableHead className="w-[100px]">Table</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(entry.created_at)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.user_full_name}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${ACTION_COLORS[entry.action]}`}>
                          {entry.action.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {TABLE_LABELS[entry.table_name]}
                      </TableCell>
                      <TableCell className="text-sm">
                        {entry.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} entries
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffset(offset + limit)}
                    disabled={offset + limit >= total}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
