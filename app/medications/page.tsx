"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert } from "@/components/ui/alert"
import { Search, Plus, Edit, Trash2, Pill, User, Eye, Loader2, RefreshCw, AlertCircle, Calendar, UserCheck } from "lucide-react"
import { MedicationDialog } from "@/components/medication-dialog"

// Mock medication data
const mockMedications = [
  {
    id: "M001",
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    patient: "John Doe",
    patientId: "P001",
    prescribedBy: "Dr. Sarah Smith",
    startDate: "2024-01-01",
    endDate: "2024-06-01",
    status: "Active",
    notes: "Take with meals to reduce stomach upset",
  },
  {
    id: "M002",
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    patient: "John Doe",
    patientId: "P001",
    prescribedBy: "Dr. Sarah Smith",
    startDate: "2024-01-01",
    endDate: "",
    status: "Active",
    notes: "Monitor blood pressure regularly",
  },
  {
    id: "M003",
    name: "Albuterol Inhaler",
    dosage: "90mcg",
    frequency: "As needed",
    patient: "Jane Smith",
    patientId: "P002",
    prescribedBy: "Dr. Michael Brown",
    startDate: "2023-12-15",
    endDate: "",
    status: "Active",
    notes: "Use for asthma symptoms",
  },
  {
    id: "M004",
    name: "Atorvastatin",
    dosage: "20mg",
    frequency: "Once daily",
    patient: "Mike Johnson",
    patientId: "P003",
    prescribedBy: "Dr. Sarah Smith",
    startDate: "2023-11-01",
    endDate: "",
    status: "Active",
    notes: "Take in the evening",
  },
  {
    id: "M005",
    name: "Ibuprofen",
    dosage: "600mg",
    frequency: "Three times daily",
    patient: "David Brown",
    patientId: "P005",
    prescribedBy: "Dr. Michael Brown",
    startDate: "2024-01-10",
    endDate: "2024-01-24",
    status: "Completed",
    notes: "For back pain management",
  },
]

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  patient: string;
  patientId: string;
  prescribedBy: string;
  startDate: string;
  endDate: string;
  status: string;
  notes: string;
  medicationCode?: string;
  route?: string;
  effectivePeriod?: {
    start: string;
    end?: string;
  };
  dosageInstruction?: string;
  reasonCode?: string;
}

export default function MedicationsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [medications, setMedications] = useState<Medication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch medications from FHIR API
  const fetchMedications = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/medications?_count=50', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch medications: ${response.status}`)
      }

      const data = await response.json()
      
      // Transform FHIR data to our Medication interface
      if (data.entry && Array.isArray(data.entry)) {
        const transformedMedications = data.entry.map((entry: Record<string, unknown>) => {
          const medication = entry.resource as Record<string, unknown>
          return {
            id: (medication.id as string) || 'N/A',
            name: (medication.medicationCodeableConcept as Record<string, unknown>)?.text as string || 
                  ((medication.medicationCodeableConcept as Record<string, unknown>)?.coding as Record<string, unknown>[])?.[0]?.display as string || 'N/A',
            dosage: 'N/A', // Simplified for now - would need proper FHIR parsing
            frequency: (medication.dosage as Record<string, unknown>[])?.[0] && 
                      Array.isArray(medication.dosage) && 
                      ((medication.dosage as Record<string, unknown>[])[0] as Record<string, unknown>).text as string || 'N/A',
            patient: (medication.subject as Record<string, unknown>)?.display as string || 'N/A',
            patientId: (medication.subject as Record<string, unknown>)?.reference as string || 'N/A',
            prescribedBy: (medication.informationSource as Record<string, unknown>)?.display as string || 'N/A',
            startDate: (medication.effectivePeriod as Record<string, unknown>)?.start as string || 'N/A',
            endDate: (medication.effectivePeriod as Record<string, unknown>)?.end as string || '',
            status: (medication.status as string) || 'N/A',
            notes: (medication.note as Record<string, unknown>[])?.[0] && 
                   Array.isArray(medication.note) && 
                   ((medication.note as Record<string, unknown>[])[0] as Record<string, unknown>).text as string || '',
            medicationCode: ((medication.medicationCodeableConcept as Record<string, unknown>)?.coding as Record<string, unknown>[])?.[0]?.code as string || 'N/A',
            route: 'N/A', // Simplified for now - would need proper FHIR parsing
            effectivePeriod: {
              start: (medication.effectivePeriod as Record<string, unknown>)?.start as string || 'N/A',
              end: (medication.effectivePeriod as Record<string, unknown>)?.end as string || ''
            },
            dosageInstruction: (medication.dosage as Record<string, unknown>[])?.[0] && 
                              Array.isArray(medication.dosage) && 
                              ((medication.dosage as Record<string, unknown>[])[0] as Record<string, unknown>).text as string || 'N/A',
            reasonCode: (medication.reasonCode as Record<string, unknown>[])?.[0] && 
                       Array.isArray(medication.reasonCode) && 
                       ((medication.reasonCode as Record<string, unknown>[])[0] as Record<string, unknown>).coding && 
                       Array.isArray(((medication.reasonCode as Record<string, unknown>[])[0] as Record<string, unknown>).coding) &&
                       (((medication.reasonCode as Record<string, unknown>[])[0] as Record<string, unknown>).coding as Record<string, unknown>[])[0]?.display as string || 'N/A',
          }
        })
        setMedications(transformedMedications)
      } else {
        // Fallback to mock data if no FHIR data
        setMedications(mockMedications)
      }
    } catch (err) {
      console.error('Error fetching medications:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch medications')
      // Fallback to mock data on error
      setMedications(mockMedications)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchMedications()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchMedications()
    setIsRefreshing(false)
  }

  const filteredMedications = medications.filter(
    (medication) =>
      medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medication.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medication.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medication.prescribedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medication.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewMedication = (medication: Medication) => {
    // Navigate to medication detail page (if we create one)
    router.push(`/medications/${medication.id}`)
  }

  const handleEdit = (medication: Medication) => {
    setSelectedMedication(medication)
    setIsEditDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Completed":
        return "bg-blue-100 text-blue-800"
      case "Discontinued":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medications</h1>
          <p className="text-muted-foreground">Manage patient medications and prescriptions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 w-9"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh medications</span>
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Medication
        </Button>
      </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div>
            <h4 className="font-medium">Error loading medications</h4>
            <p className="text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </Alert>
      )}

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Search Medications</CardTitle>
          <CardDescription>Search by medication name, patient, or prescribing doctor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search medications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Medications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Medication Records</CardTitle>
          <CardDescription>
            {isLoading ? "Loading medications..." : `${filteredMedications.length} medication${filteredMedications.length !== 1 ? "s" : ""} found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading medication records...</p>
              </div>
            </div>
          ) : filteredMedications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Pill className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No medications found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Try adjusting your search criteria" : "Get started by adding your first medication"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Medication
                </Button>
              )}
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medication</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Dosage & Frequency</TableHead>
                <TableHead>Prescribed By</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMedications.map((medication) => (
                  <TableRow key={medication.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="font-medium">{medication.name}</div>
                          <Badge variant="outline" className="font-mono text-xs mt-1">
                            {medication.id}
                          </Badge>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{medication.patient}</div>
                          <Badge variant="outline" className="font-mono text-xs mt-1">
                            {medication.patientId}
                          </Badge>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{medication.dosage}</div>
                      <div className="text-sm text-muted-foreground">{medication.frequency}</div>
                    </div>
                  </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <UserCheck className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{medication.prescribedBy}</span>
                      </div>
                    </TableCell>
                  <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>Start: {medication.startDate !== 'N/A' ? new Date(medication.startDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      {medication.endDate && (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>End: {new Date(medication.endDate).toLocaleDateString()}</span>
                          </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                      <Badge className={getStatusColor(medication.status)}>
                        {medication.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <span className="text-sm truncate block">{medication.notes || 'No notes'}</span>
                  </TableCell>
                  <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewMedication(medication)}
                          className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View medication</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEdit(medication)}
                          className="h-8 w-8 hover:bg-orange-50 hover:text-orange-600"
                        >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit medication</span>
                      </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50"
                        >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete medication</span>
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

      {/* Add Medication Dialog */}
      <MedicationDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      {/* Edit Medication Dialog */}
      <MedicationDialog medication={selectedMedication} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
    </div>
  )
}
