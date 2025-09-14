"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Eye, Edit, Trash2, Phone, Calendar } from "lucide-react"
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

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const filteredPatients = mockPatients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      patient.dob.includes(searchTerm),
  )

  const handleViewPatient = (patient: any) => {
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
        <Button onClick={() => setIsAddDialogOpen(true)} className="cursor-pointer hover:bg-white hover:text-gray-900 border-2 border-gray-950">
          <Plus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </div>

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
            {filteredPatients.length} patient{filteredPatients.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {patient.phone}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(patient.dob).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {new Date(patient.lastAppointment).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={patient.status === "Active" ? "default" : "secondary"}>{patient.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewPatient(patient)}
                        className="h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View patient</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit patient</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete patient</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Patient Dialog */}
      <PatientDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      {/* Patient Detail Dialog */}
      <PatientDetailDialog patient={selectedPatient} open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen} />
    </div>
  )
}
