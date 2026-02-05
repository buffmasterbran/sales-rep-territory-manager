"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RepTable } from "@/components/rep-table"
import { RepUpload } from "@/components/rep-upload"
import { TerritoryUpload } from "@/components/territory-upload"
import { TerritorySearch } from "@/components/territory-search"
import { HelpGuide } from "@/components/help-guide"
import { Users, UserPlus, Upload, Search, HelpCircle, Loader2 } from "lucide-react"
import type { Rep } from "@/lib/types"

export default function AdminPage() {
  const [reps, setReps] = useState<Rep[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchReps = async () => {
    try {
      const response = await fetch("/api/reps")
      if (response.ok) {
        const data = await response.json()
        setReps(data)
      }
    } catch (error) {
      console.error("Error fetching reps:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReps()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground mt-1">
          Manage sales reps and territory assignments.
        </p>
      </div>

      <Tabs defaultValue="reps" className="space-y-4">
        <TabsList className="grid w-full max-w-3xl grid-cols-5">
          <TabsTrigger value="reps" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Reps
          </TabsTrigger>
          <TabsTrigger value="rep-upload" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Rep Upload
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Territories
          </TabsTrigger>
          <TabsTrigger value="lookup" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Lookup
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Help
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reps" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <RepTable reps={reps} onRefresh={fetchReps} />
          )}
        </TabsContent>

        <TabsContent value="rep-upload">
          <RepUpload onSuccess={fetchReps} />
        </TabsContent>

        <TabsContent value="upload">
          <TerritoryUpload />
        </TabsContent>

        <TabsContent value="lookup">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <TerritorySearch reps={reps} onRefresh={fetchReps} />
          )}
        </TabsContent>

        <TabsContent value="help">
          <HelpGuide />
        </TabsContent>
      </Tabs>
    </div>
  )
}
