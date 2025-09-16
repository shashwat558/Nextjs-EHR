"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert } from "@/components/ui/alert"
import { Search, Plus, Eye, Edit, Trash2, Phone, Calendar, Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { PatientDialog } from "@/components/patient-dialog"
import { PatientDetailDialog } from "@/components/patient-detail-dialog"

// Mock patient data
const mockPatients = [
  {
    id: "P001",
    name: "John Doe",
    phone: "(555) 123-4567",
    dob: "1985-03-15",
    lastAppointment: "2024-01-10",
    status: "Active",
    email: "john.doe@email.com",
    address: "123 Main St, City, State 12345",
    emergencyContact: "Jane Doe - (555) 987-6543",
    allergies: ["Penicillin", "Shellfish"],
    conditions: ["Hypertension", "Type 2 Diabetes"],
    medications: ["Metformin 500mg", "Lisinopril 10mg"],
  },
  {
    id: "P002",
    name: "Jane Smith",
    phone: "(555) 234-5678",
    dob: "1990-07-22",
    lastAppointment: "2024-01-08",
    status: "Active",
    email: "jane.smith@email.com",
    address: "456 Oak Ave, City, State 12345",
    emergencyContact: "Bob Smith - (555) 876-5432",
    allergies: ["Latex"],
    conditions: ["Asthma"],
    medications: ["Albuterol Inhaler"],
  },
  {
    id: "P003",
    name: "Mike Johnson",
    phone: "(555) 345-6789",
    dob: "1978-11-03",
    lastAppointment: "2023-12-20",
    status: "Inactive",
    email: "mike.johnson@email.com",
    address: "789 Pine St, City, State 12345",
    emergencyContact: "Sarah Johnson - (555) 765-4321",
    allergies: [],
    conditions: ["High Cholesterol"],
    medications: ["Atorvastatin 20mg"],
  },
  {
    id: "P004",
    name: "Sarah Wilson",
    phone: "(555) 456-7890",
    dob: "1995-05-18",
    lastAppointment: "2024-01-12",
    status: "Active",
    email: "sarah.wilson@email.com",
    address: "321 Elm St, City, State 12345",
    emergencyContact: "Tom Wilson - (555) 654-3210",
    allergies: ["Peanuts", "Sulfa drugs"],
    conditions: [],
    medications: [],
  },
  {
    id: "P005",
    name: "David Brown",
    phone: "(555) 567-8901",
    dob: "1982-09-12",
    lastAppointment: "2024-01-09",
    status: "Active",
    email: "david.brown@email.com",
    address: "654 Maple Dr, City, State 12345",
    emergencyContact: "Lisa Brown - (555) 543-2109",
    allergies: ["Codeine"],
    conditions: ["Chronic Back Pain"],
    medications: ["Ibuprofen 600mg"],
  },
]

interface Patient {
  id: string;
  name: string;
  phone: string;
  dob: string;
  lastAppointment: string;
  status: string;
  email: string;
  address: string;
  emergencyContact: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
}

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch patients from FHIR API
  const fetchPatients = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/patients?_count=50', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch patients: ${response.status}`)
      }

      const data = await response.json()
      
      // Transform FHIR data to our Patient interface
      if (data.entry && Array.isArray(data.entry)) {
        const transformedPatients = data.entry.map((entry: Record<string, unknown>) => {
          const patient = entry.resource as Record<string, unknown>
          return {
            id: (patient.id as string) || 'N/A',
            name: patient.name && Array.isArray(patient.name) && patient.name[0] 
              ? `${((patient.name[0] as Record<string, unknown>).given as string[])?.[0] || ''} ${((patient.name[0] as Record<string, unknown>).family as string) || ''}`.trim() 
              : 'N/A',
            phone: (patient.telecom as Record<string, unknown>[])?.[0] && 
              Array.isArray(patient.telecom) && 
              (patient.telecom as Record<string, unknown>[]).find((t: Record<string, unknown>) => t.system === 'phone')?.value as string || 'N/A',
            dob: (patient.birthDate as string) || 'N/A',
            lastAppointment: 'N/A', // This would need to be fetched separately
            status: patient.active ? 'Active' : 'Inactive',
            email: (patient.telecom as Record<string, unknown>[])?.[0] && 
              Array.isArray(patient.telecom) && 
              (patient.telecom as Record<string, unknown>[]).find((t: Record<string, unknown>) => t.system === 'email')?.value as string || 'N/A',
            address: patient.address && Array.isArray(patient.address) && patient.address[0] 
              ? `${((patient.address[0] as Record<string, unknown>).line as string[])?.[0] || ''}, ${((patient.address[0] as Record<string, unknown>).city as string) || ''}, ${((patient.address[0] as Record<string, unknown>).state as string) || ''} ${((patient.address[0] as Record<string, unknown>).postalCode as string) || ''}`.trim() 
              : 'N/A',
            emergencyContact: 'N/A', 
            allergies: [], 
            conditions: [], 
            medications: [],
          }
        })
        setPatients(transformedPatients)
      } else {
        // Fallback to mock data if no FHIR data
        setPatients(mockPatients)
      }
    } catch (err) {
      console.error('Error fetching patients:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch patients')
      // Fallback to mock data on error
      setPatients(mockPatients)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchPatients()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchPatients()
    setIsRefreshing(false)
  }

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      patient.dob.includes(searchTerm) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsDetailDialogOpen(true)
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">Manage your patient records and information</p>
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
            <span className="sr-only">Refresh patients</span>
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div>
            <h4 className="font-medium">Error loading patients</h4>
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
          <CardTitle>Search Patients</CardTitle>
          <CardDescription>Search by name, ID, phone number, or date of birth</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Records</CardTitle>
          <CardDescription>
            {isLoading ? "Loading patients..." : `${filteredPatients.length} patient${filteredPatients.length !== 1 ? "s" : ""} found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading patient records...</p>
              </div>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No patients found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Try adjusting your search criteria" : "Get started by adding your first patient"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Patient
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Last Appointment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {patient.id}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{patient.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {patient.dob !== 'N/A' ? new Date(patient.dob).toLocaleDateString() : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {patient.lastAppointment !== 'N/A' ? new Date(patient.lastAppointment).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={patient.status === "Active" ? "default" : "secondary"}
                        className={patient.status === "Active" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                      >
                        {patient.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewPatient(patient)}
                          className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View patient</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-orange-50 hover:text-orange-600"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit patient</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete patient</span>
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

      {/* Add Patient Dialog */}
      <PatientDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onPatientCreated={fetchPatients}
      />

      {/* Patient Detail Dialog */}
      <PatientDetailDialog 
        patient={selectedPatient} 
        open={isDetailDialogOpen} 
        onOpenChange={setIsDetailDialogOpen} 
      />
    </div>
  )
}
