"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Rep, Channel } from "@/lib/types"
import { CHANNELS } from "@/lib/types"

const repSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  agency: z.string().optional(),
  channel: z.enum(["Golf", "Promo", "Gift"], {
    required_error: "Channel is required",
  }),
})

type RepFormData = z.infer<typeof repSchema>

interface RepFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rep?: Rep | null
  onSubmit: (data: RepFormData) => Promise<void>
}

export function RepForm({ open, onOpenChange, rep, onSubmit }: RepFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RepFormData>({
    resolver: zodResolver(repSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      agency: "",
      channel: undefined,
    },
  })

  // Reset form when dialog opens/closes or rep changes
  useEffect(() => {
    if (open) {
      if (rep) {
        reset({
          first_name: rep.first_name,
          last_name: rep.last_name,
          email: rep.email,
          phone: rep.phone || "",
          agency: rep.agency || "",
          channel: rep.channel,
        })
      } else {
        reset({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          agency: "",
          channel: undefined,
        })
      }
      setError(null)
    }
  }, [open, rep, reset])

  const handleFormSubmit = async (data: RepFormData) => {
    setIsSubmitting(true)
    setError(null)
    try {
      await onSubmit(data)
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{rep ? "Edit Rep" : "Add New Rep"}</DialogTitle>
          <DialogDescription>
            {rep
              ? "Update the rep's information below."
              : "Fill in the details to add a new sales rep."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  {...register("first_name")}
                  placeholder="Mary"
                />
                {errors.first_name && (
                  <p className="text-sm text-destructive">{errors.first_name.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  {...register("last_name")}
                  placeholder="Watson"
                />
                {errors.last_name && (
                  <p className="text-sm text-destructive">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="mary@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="555-123-4567"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="agency">Agency</Label>
              <Input
                id="agency"
                {...register("agency")}
                placeholder="Schauben and Co. (leave blank if independent)"
              />
              <p className="text-xs text-muted-foreground">
                Leave blank if the rep is independent
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="channel">Channel *</Label>
              <Select
                onValueChange={(value) => setValue("channel", value as Channel)}
                defaultValue={rep?.channel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a channel" />
                </SelectTrigger>
                <SelectContent>
                  {CHANNELS.map((channel) => (
                    <SelectItem key={channel} value={channel}>
                      {channel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.channel && (
                <p className="text-sm text-destructive">{errors.channel.message}</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : rep ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
