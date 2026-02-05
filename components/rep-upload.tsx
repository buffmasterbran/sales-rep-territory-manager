"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import Papa from "papaparse"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, CheckCircle, AlertCircle, XCircle, Download } from "lucide-react"

interface UploadResult {
  created: number
  updated: number
  errors: { row: number; message: string }[]
}

interface RepUploadProps {
  onSuccess: () => void
}

export function RepUpload({ onSuccess }: RepUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<any[] | null>(null)
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)

  // Download CSV template
  const downloadTemplate = () => {
    const template = `first_name,last_name,email,phone,agency,channel
Mary,Watson,mary.watson@example.com,555-123-4567,Schauben and Co.,Golf
John,Smith,john.smith@example.com,555-234-5678,,Outdoor
Bob,Wilson,bob.wilson@example.com,555-345-6789,ABC Agency,Gift
Alice,Brown,alice.brown@example.com,,,Golf`

    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "rep_upload_template.csv")
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
        const requiredColumns = ['first_name', 'last_name', 'email', 'channel']
        for (const col of requiredColumns) {
          if (!headers.includes(col)) {
            errors.push(`Missing required column: '${col}'`)
          }
        }

        if (errors.length > 0) {
          setParseErrors(errors)
          setParsedData(null)
          return
        }

        // Extract data
        const data = results.data as any[]
        const validRows = data.filter(row => 
          row.first_name?.trim() && 
          row.last_name?.trim() && 
          row.email?.trim() && 
          row.channel?.trim()
        )

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
    if (!parsedData) return

    setIsUploading(true)
    setUploadResult(null)

    try {
      const response = await fetch("/api/reps/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: parsedData }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Upload failed")
      }

      setUploadResult(result)
      
      // Refresh the reps list if any were created/updated
      if (result.created > 0 || result.updated > 0) {
        onSuccess()
      }
    } catch (error: any) {
      setUploadResult({
        created: 0,
        updated: 0,
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
            Download the template, fill it out with your rep data, then upload it below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Rep Template
          </Button>
        </CardContent>
      </Card>

      {/* CSV Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Reps CSV</CardTitle>
          <CardDescription>
            Upload a CSV file with rep information. Existing reps (matched by email) will be updated.
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
                  {parsedData.length} reps ready to upload
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Preview: {parsedData.slice(0, 3).map((r) => `${r.first_name} ${r.last_name}`).join(", ")}
                {parsedData.length > 3 && ` ... and ${parsedData.length - 3} more`}
              </p>
            </div>
          )}

          {/* Upload Button */}
          {parsedData && (
            <div className="mt-4">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Upload Reps"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Results */}
      {uploadResult && (
        <Card className={(uploadResult.created > 0 || uploadResult.updated > 0) ? "border-green-500" : "border-destructive"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(uploadResult.created > 0 || uploadResult.updated > 0) ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              Upload Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadResult.created > 0 && (
              <p className="text-green-600 font-medium">
                {uploadResult.created} rep(s) created
              </p>
            )}
            {uploadResult.updated > 0 && (
              <p className="text-blue-600 font-medium">
                {uploadResult.updated} rep(s) updated
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
            Your CSV file must have these columns:
          </p>
          <div className="bg-muted p-4 rounded-md overflow-x-auto">
            <table className="text-sm w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-2 pr-4 font-semibold">first_name*</th>
                  <th className="text-left pb-2 pr-4 font-semibold">last_name*</th>
                  <th className="text-left pb-2 pr-4 font-semibold">email*</th>
                  <th className="text-left pb-2 pr-4 font-semibold">phone</th>
                  <th className="text-left pb-2 pr-4 font-semibold">agency</th>
                  <th className="text-left pb-2 font-semibold">channel*</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                <tr><td className="py-1 pr-4">Mary</td><td className="pr-4">Watson</td><td className="pr-4">mary@example.com</td><td className="pr-4">555-1234</td><td className="pr-4">Schauben and Co.</td><td>Golf</td></tr>
                <tr><td className="py-1 pr-4">John</td><td className="pr-4">Smith</td><td className="pr-4">john@example.com</td><td className="pr-4"></td><td className="pr-4"></td><td>Outdoor</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">* Required fields</p>
          <div className="space-y-2 text-sm">
            <p><strong>channel</strong> - Must be: Golf, Outdoor, or Gift</p>
            <p><strong>agency</strong> - Leave blank if rep is independent</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm">
            <p className="font-medium text-blue-800">How it works:</p>
            <ul className="mt-2 text-blue-700 space-y-1 list-disc list-inside">
              <li>If email already exists → rep info is <strong>updated</strong></li>
              <li>If email is new → rep is <strong>created</strong></li>
              <li>Email matching is case-insensitive</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
