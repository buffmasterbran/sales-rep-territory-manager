"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { RepForm } from "@/components/rep-form"
import { Pencil, Trash2, Plus, Search } from "lucide-react"
import type { Rep, Channel } from "@/lib/types"
import { CHANNELS, getRepFullName } from "@/lib/types"
import { formatPhone } from "@/lib/utils"

interface RepTableProps {
  reps: Rep[]
  onRefresh: () => void
}

export function RepTable({ reps, onRefresh }: RepTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [channelFilter, setChannelFilter] = useState<Channel | "all">("all")
  const [formOpen, setFormOpen] = useState(false)
  const [editingRep, setEditingRep] = useState<Rep | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingRep, setDeletingRep] = useState<Rep | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filter reps based on search and channel
  const filteredReps = reps.filter((rep) => {
    const fullName = getRepFullName(rep).toLowerCase()
    const matchesSearch =
      searchQuery === "" ||
      fullName.includes(searchQuery.toLowerCase()) ||
      rep.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rep.agency && rep.agency.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesChannel = channelFilter === "all" || rep.channel === channelFilter
    return matchesSearch && matchesChannel
  })

  const handleCreate = async (data: {
    first_name: string
    last_name: string
    email: string
    phone?: string
    agency?: string
    channel: Channel
  }) => {
    const response = await fetch("/api/reps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        phone: data.phone || null,
        agency: data.agency || null,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create rep")
    }

    onRefresh()
  }

  const handleUpdate = async (data: {
    first_name: string
    last_name: string
    email: string
    phone?: string
    agency?: string
    channel: Channel
  }) => {
    if (!editingRep) return

    const response = await fetch(`/api/reps/${editingRep.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        phone: data.phone || null,
        agency: data.agency || null,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to update rep")
    }

    onRefresh()
  }

  const handleDelete = async () => {
    if (!deletingRep) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/reps/${deletingRep.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete rep")
      }

      onRefresh()
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setDeletingRep(null)
    }
  }

  const openEditForm = (rep: Rep) => {
    setEditingRep(rep)
    setFormOpen(true)
  }

  const openCreateForm = () => {
    setEditingRep(null)
    setFormOpen(true)
  }

  const openDeleteDialog = (rep: Rep) => {
    setDeletingRep(rep)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or agency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select
            value={channelFilter}
            onValueChange={(value) => setChannelFilter(value as Channel | "all")}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Channels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              {CHANNELS.map((channel) => (
                <SelectItem key={channel} value={channel}>
                  {channel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Add Rep
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Agency</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReps.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  {reps.length === 0
                    ? "No reps yet. Click 'Add Rep' to create one."
                    : "No reps match your search criteria."}
                </TableCell>
              </TableRow>
            ) : (
              filteredReps.map((rep) => (
                <TableRow key={rep.id}>
                  <TableCell className="font-medium">
                    {getRepFullName(rep)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {rep.agency || <span className="italic">Independent</span>}
                  </TableCell>
                  <TableCell>{rep.email}</TableCell>
                  <TableCell>{formatPhone(rep.phone)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        rep.channel === "Golf"
                          ? "bg-green-100 text-green-800"
                          : rep.channel === "Outdoor"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {rep.channel}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditForm(rep)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(rep)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredReps.length} of {reps.length} reps
      </p>

      {/* Add/Edit Form */}
      <RepForm
        open={formOpen}
        onOpenChange={setFormOpen}
        rep={editingRep}
        onSubmit={editingRep ? handleUpdate : handleCreate}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rep</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {deletingRep && getRepFullName(deletingRep)}
              </span>
              ? This will also remove all their territory assignments. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
