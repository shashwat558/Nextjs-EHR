"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, AlertTriangle, User, RefreshCw } from "lucide-react"
import { AllergyDialog } from "@/components/allergy-dialog"

interface AllergyUI {
  id: string
  allergen: string
  patient: string
  patientId: string
  severity: string
  reaction: string
  notes: string
  dateReported: string
  reportedBy: string
}

export default function AllergiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedAllergy, setSelectedAllergy] = useState<AllergyUI | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [allergies, setAllergies] = useState<AllergyUI[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchAllergies = async () => {
    try {
      setIsLoading(true)

      const res = await fetch('/api/allergies?_count=50', {
        headers: { 'accept': 'application/json' }
      })
      if (!res.ok) throw new Error(`Failed to fetch allergies: ${res.status}`)
      const data = await res.json()

      // Handle both FHIR format (data.entry) and simple array format
      let allergiesData: Record<string, unknown>[] = []
      
      if (data.entry && Array.isArray(data.entry)) {
        // FHIR format
        allergiesData = data.entry.map((entry: Record<string, unknown>) => entry.resource as Record<string, unknown>)
      } else if (Array.isArray(data)) {
        // Simple array format
        allergiesData = data as Record<string, unknown>[]
      }

      if (allergiesData.length > 0) {
        const transformed: AllergyUI[] = allergiesData.map((allergy: Record<string, unknown>) => {
          // Check if it's already in UI format or needs transformation
          if (allergy.id && allergy.allergen && allergy.patient && allergy.severity) {
            // Already in UI format
            return {
              id: allergy.id as string,
              allergen: allergy.allergen as string,
              patient: allergy.patient as string,
              patientId: allergy.patientId as string,
              severity: allergy.severity as string,
              reaction: allergy.reaction as string,
              notes: allergy.notes as string,
              dateReported: allergy.dateReported as string,
              reportedBy: allergy.reportedBy as string,
            }
          } else {
            // FHIR format - transform it
            const code = allergy.code as Record<string, unknown>
            const patient = allergy.patient as Record<string, unknown>
            const reactions = (allergy.reaction as Record<string, unknown>[]) || []
            const firstReaction = reactions[0] as Record<string, unknown> | undefined
            const manifestations = (firstReaction?.manifestation as Record<string, unknown>[]) || []
            const firstManifestation = manifestations[0] as Record<string, unknown> | undefined
            const manifestationCoding = (firstManifestation?.coding as Record<string, unknown>[]) || []
            const firstCoding = manifestationCoding[0] as Record<string, unknown> | undefined

            return {
              id: (allergy.id as string) || 'N/A',
              allergen: (code?.text as string) || (code?.coding as Record<string, unknown>[])?.[0]?.display as string || 'Unknown',
              patient: (patient?.display as string) || 'Unknown',
              patientId: String((patient?.reference as string) || '').replace('Patient/', '') || 'N/A',
              severity: (firstReaction?.severity as string) || 'Unknown',
              reaction: (firstCoding?.display as string) || 'Unknown',
              notes: (allergy.note as Record<string, unknown>[])?.[0]?.text as string || '',
              dateReported: (allergy.recordedDate as string) || (allergy.onsetDateTime as string) || 'N/A',
              reportedBy: (allergy.recorder as Record<string, unknown>)?.display as string || 'Unknown',
            }
          }
        })
        setAllergies(transformed)
      } else {
        setAllergies([])
      }
    } catch (err) {
      console.error('Error fetching allergies:', err)
      setAllergies([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAllergies()
  }, [])

  const filteredAllergies = allergies.filter(
    (allergy) =>
      allergy.allergen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allergy.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allergy.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allergy.reaction.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (allergy: AllergyUI) => {
    setSelectedAllergy(allergy)
    setIsEditDialogOpen(true)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Severe":
        return "bg-red-100 text-red-800"
      case "Moderate":
        return "bg-yellow-100 text-yellow-800"
      case "Mild":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Allergies</h1>
          <p className="text-muted-foreground">Manage patient allergies and adverse reactions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={async () => { setIsRefreshing(true); await fetchAllergies(); setIsRefreshing(false) }}
            className="h-9 w-9"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh allergies</span>
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-accent hover:bg-accent/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Allergy
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Search Allergies</CardTitle>
          <CardDescription>Search by allergen, patient, or reaction type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search allergies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Allergies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Allergy Records</CardTitle>
          <CardDescription>
            {isLoading ? "Loading allergies..." : `${filteredAllergies.length} allerg${filteredAllergies.length !== 1 ? "ies" : "y"} found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground py-8">Loading allergy records...</div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Allergen</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Reaction</TableHead>
                <TableHead>Date Reported</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAllergies.map((allergy) => (
                <TableRow key={allergy.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <div>
                        <div className="font-medium">{allergy.allergen}</div>
                        <div className="text-sm text-muted-foreground">{allergy.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{allergy.patient}</div>
                        <div className="text-sm text-muted-foreground">{allergy.patientId}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(allergy.severity)}>{allergy.severity}</Badge>
                  </TableCell>
                  <TableCell>{allergy.reaction}</TableCell>
                  <TableCell>{new Date(allergy.dateReported).toLocaleDateString()}</TableCell>
                  <TableCell>{allergy.reportedBy}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{allergy.notes}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(allergy)} className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit allergy</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete allergy</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Allergy Dialog */}
      <AllergyDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onAllergyCreated={fetchAllergies} />

      {/* Edit Allergy Dialog */}
      <AllergyDialog 
        allergy={selectedAllergy ? {
          id: selectedAllergy.id,
          allergen: selectedAllergy.allergen,
          patientId: selectedAllergy.patientId,
          severity: selectedAllergy.severity,
          reaction: selectedAllergy.reaction,
          notes: selectedAllergy.notes,
          dateReported: selectedAllergy.dateReported,
          reportedBy: selectedAllergy.reportedBy
        } : null} 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        onAllergyCreated={fetchAllergies} 
      />
    </div>
  )
}
