"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { 
  Users, 
  UserPlus, 
  Upload, 
  Search, 
  Edit, 
  Trash2, 
  Download,
  RefreshCw,
  Lightbulb,
  AlertTriangle,
  CheckCircle
} from "lucide-react"

export function HelpGuide() {
  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Sales Rep Territory Manager</CardTitle>
          <CardDescription>
            A complete guide to managing sales reps and their territory assignments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This application helps you manage which sales reps cover which zip codes across three channels: 
            <strong> Golf</strong>, <strong> Promo</strong>, and <strong> Gift</strong>. 
            Each zip code can have one rep per channel.
          </p>
        </CardContent>
      </Card>

      <Accordion type="single" collapsible className="space-y-2">
        {/* Reps Tab */}
        <AccordionItem value="reps" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="font-semibold">Reps Tab</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              View, add, edit, and delete individual sales reps.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <UserPlus className="h-4 w-4 mt-1 text-green-500" />
                <div>
                  <p className="font-medium text-sm">Add a Rep</p>
                  <p className="text-sm text-muted-foreground">
                    Click "Add Rep" and fill in their details: first name, last name, email, phone, agency (optional), and channel.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Edit className="h-4 w-4 mt-1 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">Edit a Rep</p>
                  <p className="text-sm text-muted-foreground">
                    Click the edit icon on any rep to update their information. All their territory assignments stay intact.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Trash2 className="h-4 w-4 mt-1 text-red-500" />
                <div>
                  <p className="font-medium text-sm">Delete a Rep</p>
                  <p className="text-sm text-muted-foreground">
                    Deleting a rep also removes all their territory assignments (cascade delete).
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-4">
              <div className="flex items-center gap-2 text-amber-800">
                <Lightbulb className="h-4 w-4" />
                <span className="font-medium text-sm">Pro Tip: Rep Replacement</span>
              </div>
              <p className="text-sm text-amber-700 mt-1">
                When a rep leaves and someone new takes over their territory, just <strong>edit</strong> the old rep's 
                info to become the new rep. All territory assignments transfer automatically — no re-uploading needed!
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Rep Upload Tab */}
        <AccordionItem value="rep-upload" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <UserPlus className="h-5 w-5 text-green-500" />
              <span className="font-semibold">Rep Upload Tab</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Bulk upload multiple reps at once via CSV file.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Download className="h-4 w-4 mt-1 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">1. Download Template</p>
                  <p className="text-sm text-muted-foreground">
                    Get the CSV template with the correct column headers.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Edit className="h-4 w-4 mt-1 text-purple-500" />
                <div>
                  <p className="font-medium text-sm">2. Fill Out Data</p>
                  <p className="text-sm text-muted-foreground">
                    Add your reps with: first_name, last_name, email, phone, agency, channel
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Upload className="h-4 w-4 mt-1 text-green-500" />
                <div>
                  <p className="font-medium text-sm">3. Upload</p>
                  <p className="text-sm text-muted-foreground">
                    Drag & drop or select your CSV file.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <strong>How it works:</strong> If an email already exists, that rep is <strong>updated</strong>. 
                If the email is new, a new rep is <strong>created</strong>.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Territory Upload Tab */}
        <AccordionItem value="territory-upload" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Upload className="h-5 w-5 text-purple-500" />
              <span className="font-semibold">Territories Tab</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Upload territory assignments — which reps cover which zip codes.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Download className="h-4 w-4 mt-1 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">1. Download Template</p>
                  <p className="text-sm text-muted-foreground">
                    Get the CSV template for territory assignments.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Edit className="h-4 w-4 mt-1 text-purple-500" />
                <div>
                  <p className="font-medium text-sm">2. Prepare Your Data</p>
                  <p className="text-sm text-muted-foreground">
                    Each row needs: zip code and rep email. The rep must already exist in the system.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Upload className="h-4 w-4 mt-1 text-green-500" />
                <div>
                  <p className="font-medium text-sm">3. Select Channel & Upload</p>
                  <p className="text-sm text-muted-foreground">
                    Choose the channel (Golf, Promo, or Gift) and upload. One upload per channel.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <strong>How it works:</strong> If a zip code already has an assignment for that channel, 
                the rep is <strong>replaced</strong>. New zips are <strong>added</strong>.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <div className="flex items-center gap-2 text-amber-800">
                <Lightbulb className="h-4 w-4" />
                <span className="font-medium text-sm">Tip</span>
              </div>
              <p className="text-sm text-amber-700 mt-1">
                You can upload a partial list — only the zip codes in your file will be affected. 
                Existing assignments for other zips remain unchanged.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Lookup Tab */}
        <AccordionItem value="lookup" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-orange-500" />
              <span className="font-semibold">Lookup Tab</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Search for a zip code to see which reps are assigned to it, and make changes.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Search className="h-4 w-4 mt-1 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">Search by Zip Code</p>
                  <p className="text-sm text-muted-foreground">
                    Enter a 5-digit zip code to see all reps assigned to it (across all channels).
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <RefreshCw className="h-4 w-4 mt-1 text-purple-500" />
                <div>
                  <p className="font-medium text-sm">Reassign</p>
                  <p className="text-sm text-muted-foreground">
                    Change the rep for a specific zip code and channel using the dropdown.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Trash2 className="h-4 w-4 mt-1 text-red-500" />
                <div>
                  <p className="font-medium text-sm">Delete Assignment</p>
                  <p className="text-sm text-muted-foreground">
                    Remove an assignment entirely, leaving that zip/channel unassigned.
                  </p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Common Workflows */}
        <AccordionItem value="workflows" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-semibold">Common Workflows</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <p className="font-medium text-sm">Initial Setup (Day 1)</p>
                <ol className="text-sm text-muted-foreground list-decimal list-inside mt-1 space-y-1">
                  <li>Upload all reps via <strong>Rep Upload</strong></li>
                  <li>Upload Golf territories via <strong>Territories</strong></li>
                  <li>Upload Promo territories via <strong>Territories</strong></li>
                  <li>Upload Gift territories via <strong>Territories</strong></li>
                </ol>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="font-medium text-sm">Rep Leaves, Replacement Takes Over Same Territory</p>
                <ol className="text-sm text-muted-foreground list-decimal list-inside mt-1 space-y-1">
                  <li>Go to <strong>Reps</strong> tab</li>
                  <li>Edit the leaving rep</li>
                  <li>Change info to the new rep</li>
                  <li>Save — done! All territories transferred.</li>
                </ol>
              </div>
              
              <div className="border-l-4 border-purple-500 pl-4">
                <p className="font-medium text-sm">Rep Leaves, Territory Needs Reassignment</p>
                <ol className="text-sm text-muted-foreground list-decimal list-inside mt-1 space-y-1">
                  <li>Delete the rep from <strong>Reps</strong> tab (removes all their assignments)</li>
                  <li>Upload new territory assignments via <strong>Territories</strong></li>
                </ol>
              </div>
              
              <div className="border-l-4 border-orange-500 pl-4">
                <p className="font-medium text-sm">Fix a Single Zip Code Assignment</p>
                <ol className="text-sm text-muted-foreground list-decimal list-inside mt-1 space-y-1">
                  <li>Go to <strong>Lookup</strong> tab</li>
                  <li>Search for the zip code</li>
                  <li>Use the dropdown to reassign or delete</li>
                </ol>
              </div>
              
              <div className="border-l-4 border-amber-500 pl-4">
                <p className="font-medium text-sm">Add a New Rep</p>
                <ol className="text-sm text-muted-foreground list-decimal list-inside mt-1 space-y-1">
                  <li>Add them via <strong>Reps</strong> tab (single) or <strong>Rep Upload</strong> (bulk)</li>
                  <li>Upload their territory assignments via <strong>Territories</strong></li>
                </ol>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Public Lookup */}
        <AccordionItem value="public" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-teal-500" />
              <span className="font-semibold">Public Lookup Page</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              There's also a public page at <code className="bg-muted px-1 rounded">/lookup</code> where 
              anyone can enter a zip code and see which reps are assigned.
            </p>
            <p className="text-sm text-muted-foreground">
              This page is read-only and doesn't require login. It shows all three channels 
              (Golf, Promo, Gift) with the assigned rep or "Not Assigned" for each.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <strong>API Access:</strong> You can also query programmatically via 
                <code className="bg-blue-100 px-1 rounded ml-1">/api/get-reps?zip=12345</code>
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Troubleshooting */}
        <AccordionItem value="troubleshooting" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="font-semibold">Troubleshooting</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-4">
              <div>
                <p className="font-medium text-sm text-red-600">"Rep not found" when uploading territories</p>
                <p className="text-sm text-muted-foreground mt-1">
                  The email in your CSV doesn't match any rep. Make sure the rep exists first 
                  (upload reps before territories).
                </p>
              </div>
              
              <div>
                <p className="font-medium text-sm text-red-600">"Invalid channel" error</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Channel must be exactly: <code>Golf</code>, <code>Promo</code>, or <code>Gift</code> (case-sensitive).
                </p>
              </div>
              
              <div>
                <p className="font-medium text-sm text-red-600">CSV upload shows 0 rows</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Check that your CSV has the correct headers and data isn't empty. 
                  Download and compare with the template.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
