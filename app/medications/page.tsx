"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Pill, User } from "lucide-react"
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

export default function MedicationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedMedication, setSelectedMedication] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const filteredMedications = mockMedications.filter(
    (medication) =>
      medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medication.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medication.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medication.prescribedBy.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (medication: any) => {
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
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-accent hover:bg-accent/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Medication
        </Button>
      </div>

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
            {filteredMedications.length} medication{filteredMedications.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                <TableRow key={medication.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="font-medium">{medication.name}</div>
                        <div className="text-sm text-muted-foreground">{medication.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{medication.patient}</div>
                        <div className="text-sm text-muted-foreground">{medication.patientId}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{medication.dosage}</div>
                      <div className="text-sm text-muted-foreground">{medication.frequency}</div>
                    </div>
                  </TableCell>
                  <TableCell>{medication.prescribedBy}</TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">Start: {new Date(medication.startDate).toLocaleDateString()}</div>
                      {medication.endDate && (
                        <div className="text-sm">End: {new Date(medication.endDate).toLocaleDateString()}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(medication.status)}>{medication.status}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{medication.notes}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(medication)} className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit medication</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete medication</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Medication Dialog */}
      <MedicationDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      {/* Edit Medication Dialog */}
      <MedicationDialog medication={selectedMedication} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
    </div>
  )
}
