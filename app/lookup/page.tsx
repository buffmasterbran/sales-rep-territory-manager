"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Search, User, Mail, Phone, Building2, Loader2 } from "lucide-react"
import type { GetRepsResponse, Channel } from "@/lib/types"
import { CHANNELS, getRepFullName } from "@/lib/types"
import { validateZipCode, formatPhone } from "@/lib/utils"

export default function LookupPage() {
  const [zip, setZip] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GetRepsResponse | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
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
        throw new Error(data.error || "Failed to fetch reps")
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message || "An error occurred")
      setResult(null)
    } finally {
      setIsSearching(false)
    }
  }

  const getChannelColor = (channel: Channel) => {
    switch (channel) {
      case "Golf":
        return "bg-green-50 border-green-200"
      case "Promo":
        return "bg-blue-50 border-blue-200"
      case "Gift":
        return "bg-purple-50 border-purple-200"
    }
  }

  const getChannelBadgeColor = (channel: Channel) => {
    switch (channel) {
      case "Golf":
        return "bg-green-100 text-green-800"
      case "Promo":
        return "bg-blue-100 text-blue-800"
      case "Gift":
        return "bg-purple-100 text-purple-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">Sales Territory Manager</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Search Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Find Your Sales Rep
            </h1>
            <p className="text-muted-foreground">
              Enter your zip code to find the sales representatives for your area.
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter zip code (e.g., 12345)"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="pl-10 text-lg h-12"
                    maxLength={5}
                  />
                </div>
                <Button type="submit" size="lg" disabled={isSearching} className="h-12 px-6">
                  {isSearching ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </form>
              {error && (
                <p className="text-sm text-destructive mt-3">{error}</p>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {hasSearched && result && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center mb-6">
                Sales Reps for Zip Code: <span className="text-primary">{result.zip}</span>
              </h2>

              <div className="grid gap-4">
                {CHANNELS.map((channel) => {
                  const rep = result.reps[channel]
                  return (
                    <Card
                      key={channel}
                      className={`${getChannelColor(channel)} border-2`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{channel}</CardTitle>
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
                        {rep ? (
                          <div className="space-y-2">
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
                              <a
                                href={`mailto:${rep.email}`}
                                className="text-primary hover:underline"
                              >
                                {rep.email}
                              </a>
                            </div>
                            {rep.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <a
                                  href={`tel:${rep.phone}`}
                                  className="text-primary hover:underline"
                                >
                                  {formatPhone(rep.phone)}
                                </a>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            No sales representative assigned to this territory for {channel}.
                          </p>
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
            <div className="text-center text-muted-foreground">
              <MapPin className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p>Enter your zip code above to find your sales representatives.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Sales Territory Manager</p>
        </div>
      </footer>
    </div>
  )
}
