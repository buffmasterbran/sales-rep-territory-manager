"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, User, Mail, Phone, Building2, Trash2, RefreshCw, Plus, Loader2 } from "lucide-react"
import type { GetRepsResponse, Rep, Channel } from "@/lib/types"
import { CHANNELS, getRepFullName, getRepDisplayName } from "@/lib/types"
import { validateZipCode, formatPhone } from "@/lib/utils"

interface TerritorySearchProps {
  reps: Rep[]
  onRefresh: () => void
}

export function TerritorySearch({ reps, onRefresh }: TerritorySearchProps) {
  const [zip, setZip] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GetRepsResponse | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingChannel, setDeletingChannel] = useState<Channel | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Reassign state
  const [reassigningChannel, setReassigningChannel] = useState<Channel | null>(null)
  const [selectedRepId, setSelectedRepId] = useState<string>("")
  const [isReassigning, setIsReassigning] = useState(false)

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError(null)

    const trimmedZip = zip.trim()
    if (!validateZipCode(trimmedZip)) {
      setError("Please enter a valid 5-digit zip code")
      return
    }

    setIsSearching(true)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/get-reps?zip=${trimmedZip}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch assignments")
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || "An error occurred")
      setResult(null)
    } finally {
      setIsSearching(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingChannel || !result) return

    setIsDeleting(true)
    try {
      const response = await fetch(
        `/api/assignments?zip_code=${result.zip}&channel=${deletingChannel}`,
        { method: "DELETE" }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete assignment")
      }

      // Refresh search results
      await handleSearch()
    } catch (err: any) {
      setError(err.message || "Failed to delete assignment")
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setDeletingChannel(null)
    }
  }

  const handleReassign = async (channel: Channel) => {
    if (!selectedRepId || !result) return

    setIsReassigning(true)
    try {
      const response = await fetch("/api/assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zip_code: result.zip,
          channel,
          rep_id: selectedRepId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to reassign")
      }

      // Refresh search results
      await handleSearch()
      setReassigningChannel(null)
      setSelectedRepId("")
    } catch (err: any) {
      setError(err.message || "Failed to reassign")
    } finally {
      setIsReassigning(false)
    }
  }

  const openDeleteDialog = (channel: Channel) => {
    setDeletingChannel(channel)
    setDeleteDialogOpen(true)
  }

  const startReassign = (channel: Channel) => {
    setReassigningChannel(channel)
    setSelectedRepId("")
  }

  const cancelReassign = () => {
    setReassigningChannel(null)
    setSelectedRepId("")
  }

  // Get reps for a specific channel
  const getRepsForChannel = (channel: Channel) => {
    return reps.filter((rep) => rep.channel === channel)
  }

  const getChannelColor = (channel: Channel) => {
    switch (channel) {
      case "Golf":
        return "border-green-200 bg-green-50"
      case "Outdoor":
        return "border-blue-200 bg-blue-50"
      case "Gift":
        return "border-purple-200 bg-purple-50"
    }
  }

  const getChannelBadgeColor = (channel: Channel) => {
    switch (channel) {
      case "Golf":
        return "bg-green-100 text-green-800"
      case "Outdoor":
        return "bg-blue-100 text-blue-800"
      case "Gift":
        return "bg-purple-100 text-purple-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Search by Zip Code</CardTitle>
          <CardDescription>
            Enter a zip code to view and manage territory assignments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter zip code"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="pl-9"
                maxLength={5}
              />
            </div>
            <Button type="submit" disabled={isSearching}>
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </form>
          {error && <p className="text-sm text-destructive mt-3">{error}</p>}
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Assignments for Zip Code: {result.zip}
            </h3>
            <Button variant="outline" size="sm" onClick={() => handleSearch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4">
            {CHANNELS.map((channel) => {
              const rep = result.reps[channel]
              const isReassigning_ = reassigningChannel === channel
              const channelReps = getRepsForChannel(channel)

              return (
                <Card key={channel} className={`border-2 ${getChannelColor(channel)}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{channel}</CardTitle>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${getChannelBadgeColor(
                          channel
                        )}`}
                      >
                        {rep ? "Assigned" : "Not Assigned"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {rep && !isReassigning_ ? (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{getRepFullName(rep)}</span>
                          </div>
                          {rep.agency && (
                            <div className="flex items-center gap-2 text-sm">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span>{rep.agency}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{rep.email}</span>
                          </div>
                          {rep.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{formatPhone(rep.phone)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startReassign(channel)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Reassign
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(channel)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : isReassigning_ ? (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Select a rep to assign to this territory:
                        </p>
                        <Select value={selectedRepId} onValueChange={setSelectedRepId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a rep" />
                          </SelectTrigger>
                          <SelectContent>
                            {channelReps.length === 0 ? (
                              <SelectItem value="_none" disabled>
                                No reps in {channel} channel
                              </SelectItem>
                            ) : (
                              channelReps.map((r) => (
                                <SelectItem key={r.id} value={r.id}>
                                  {getRepDisplayName(r)}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReassign(channel)}
                            disabled={!selectedRepId || isReassigning}
                          >
                            {isReassigning ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : null}
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelReassign}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground italic">
                          No rep assigned to this territory.
                        </p>
                        {channelReps.length > 0 ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startReassign(channel)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Assign Rep
                          </Button>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            No reps available in {channel} channel.
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Initial State */}
      {!hasSearched && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              Enter a zip code above to view and manage territory assignments.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the {deletingChannel} rep assignment
              for zip code {result?.zip}? This territory will become unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
