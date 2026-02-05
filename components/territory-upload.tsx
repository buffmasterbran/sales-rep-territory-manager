"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload, FileText, CheckCircle, AlertCircle, XCircle, Download } from "lucide-react"
import type { Channel, UploadResult } from "@/lib/types"
import { CHANNELS } from "@/lib/types"

export function TerritoryUpload() {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<{ zip: string; rep_email: string }[] | null>(null)
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)

  // Download CSV template
  const downloadTemplate = () => {
    const template = `zip,rep_email
12345,mary.watson@example.com
12346,john.smith@example.com
90210,mary.watson@example.com
28801,bob.wilson@example.com`

    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "territory_upload_template.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const csvFile = acceptedFiles[0]
    if (!csvFile) return

    setFile(csvFile)
    setUploadResult(null)
    setParseErrors([])

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: string[] = []
        
        // Check for required columns
        const headers = results.meta.fields || []
        if (!headers.includes("zip")) {
          errors.push("Missing required column: 'zip'")
        }
        if (!headers.includes("rep_email")) {
          errors.push("Missing required column: 'rep_email'")
        }

        if (errors.length > 0) {
          setParseErrors(errors)
          setParsedData(null)
          return
        }

        // Extract and validate data
        const data = results.data as { zip?: string; rep_email?: string }[]
        const validRows: { zip: string; rep_email: string }[] = []

        data.forEach((row, index) => {
          const zip = row.zip?.toString().trim()
          const rep_email = row.rep_email?.toString().trim()

          if (zip && rep_email) {
            validRows.push({ zip, rep_email })
          }
        })

        if (validRows.length === 0) {
          errors.push("No valid data rows found")
          setParseErrors(errors)
          setParsedData(null)
          return
        }

        setParsedData(validRows)
      },
      error: (error) => {
        setParseErrors([`CSV parse error: ${error.message}`])
        setParsedData(null)
      },
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  })

  const handleUpload = async () => {
    if (!selectedChannel || !parsedData) return

    setIsUploading(true)
    setUploadResult(null)

    try {
      const response = await fetch("/api/assignments/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: selectedChannel,
          rows: parsedData,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Upload failed")
      }

      setUploadResult(result)
    } catch (error: any) {
      setUploadResult({
        success: 0,
        errors: [{ row: 0, message: error.message || "Upload failed" }],
      })
    } finally {
      setIsUploading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setParsedData(null)
    setParseErrors([])
    setUploadResult(null)
  }

  return (
    <div className="space-y-6">
      {/* Download Template */}
      <Card>
        <CardHeader>
          <CardTitle>CSV Template</CardTitle>
          <CardDescription>
            Download the template, fill it out in Excel or Google Sheets, then upload it below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download CSV Template
          </Button>
        </CardContent>
      </Card>

      {/* Channel Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Select Channel</CardTitle>
          <CardDescription>
            Choose which channel these territory assignments are for.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-sm">
            <Label htmlFor="channel-select" className="sr-only">
              Channel
            </Label>
            <Select
              value={selectedChannel || ""}
              onValueChange={(value) => setSelectedChannel(value as Channel)}
            >
              <SelectTrigger id="channel-select">
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
          </div>
        </CardContent>
      </Card>

      {/* CSV Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Step 2: Upload CSV File</CardTitle>
          <CardDescription>
            Upload your completed CSV file with territory assignments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">
              {isDragActive
                ? "Drop the CSV file here..."
                : "Drag & drop a CSV file here, or click to select"}
            </p>
          </div>

          {/* File Info */}
          {file && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{file.name}</span>
              <span className="text-muted-foreground">
                ({(file.size / 1024).toFixed(1)} KB)
              </span>
              <Button variant="ghost" size="sm" onClick={reset} className="ml-auto">
                Clear
              </Button>
            </div>
          )}

          {/* Parse Errors */}
          {parseErrors.length > 0 && (
            <div className="mt-4 p-4 bg-destructive/10 rounded-md">
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-4 w-4" />
                <span className="font-medium">CSV Errors</span>
              </div>
              <ul className="mt-2 text-sm text-destructive space-y-1">
                {parseErrors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Parsed Data Preview */}
          {parsedData && (
            <div className="mt-4 p-4 bg-muted/50 rounded-md">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">
                  {parsedData.length} rows ready to upload
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Preview: {parsedData.slice(0, 3).map((r) => r.zip).join(", ")}
                {parsedData.length > 3 && ` ... and ${parsedData.length - 3} more`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Button */}
      <Card>
        <CardHeader>
          <CardTitle>Step 3: Upload Assignments</CardTitle>
          <CardDescription>
            Review and upload the territory assignments. Existing assignments for
            the same zip+channel will be updated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleUpload}
            disabled={!selectedChannel || !parsedData || isUploading}
            className="w-full sm:w-auto"
          >
            {isUploading ? "Uploading..." : "Upload Assignments"}
          </Button>
        </CardContent>
      </Card>

      {/* Upload Results */}
      {uploadResult && (
        <Card className={uploadResult.success > 0 ? "border-green-500" : "border-destructive"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {uploadResult.success > 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              Upload Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadResult.success > 0 && (
              <p className="text-green-600 font-medium">
                {uploadResult.success} assignment(s) uploaded successfully
              </p>
            )}

            {uploadResult.errors.length > 0 && (
              <div>
                <p className="text-destructive font-medium mb-2">
                  {uploadResult.errors.length} error(s):
                </p>
                <ul className="text-sm space-y-1 max-h-48 overflow-y-auto">
                  {uploadResult.errors.map((err, i) => (
                    <li key={i} className="text-destructive">
                      {err.row > 0 ? `Row ${err.row}: ` : ""}
                      {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>CSV Format Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your CSV file must have these two columns:
          </p>
          <div className="bg-muted p-4 rounded-md overflow-x-auto">
            <table className="text-sm w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-2 pr-8 font-semibold">zip</th>
                  <th className="text-left pb-2 font-semibold">rep_email</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr><td className="py-1 pr-8">12345</td><td>mary.watson@example.com</td></tr>
                <tr><td className="py-1 pr-8">12346</td><td>john.smith@example.com</td></tr>
                <tr><td className="py-1 pr-8">90210</td><td>mary.watson@example.com</td></tr>
              </tbody>
            </table>
          </div>
          <div className="space-y-2 text-sm">
            <p><strong>zip</strong> - 5-digit US zip code</p>
            <p><strong>rep_email</strong> - Email of an existing rep in the system</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-sm">
            <p className="font-medium text-amber-800">Important Notes:</p>
            <ul className="mt-2 text-amber-700 space-y-1 list-disc list-inside">
              <li>The rep must already exist in the system before uploading</li>
              <li>Uploading will overwrite existing assignments for the same zip+channel</li>
              <li>One rep can cover multiple zip codes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
