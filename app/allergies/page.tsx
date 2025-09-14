"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, AlertTriangle, User } from "lucide-react"
import { AllergyDialog } from "@/components/allergy-dialog"

// Mock allergy data
const mockAllergies = [
  {
    id: "A001",
    allergen: "Penicillin",
    patient: "John Doe",
    patientId: "P001",
    severity: "Severe",
    reaction: "Anaphylaxis",
    notes: "Requires immediate medical attention if exposed",
    dateReported: "2023-05-15",
    reportedBy: "Dr. Sarah Smith",
  },
  {
    id: "A002",
    allergen: "Shellfish",
    patient: "John Doe",
    patientId: "P001",
    severity: "Moderate",
    reaction: "Hives, swelling",
    notes: "Avoid all shellfish products",
    dateReported: "2023-05-15",
    reportedBy: "Dr. Sarah Smith",
  },
  {
    id: "A003",
    allergen: "Latex",
    patient: "Jane Smith",
    patientId: "P002",
    severity: "Mild",
    reaction: "Skin irritation",
    notes: "Use latex-free gloves during procedures",
    dateReported: "2023-08-20",
    reportedBy: "Dr. Michael Brown",
  },
  {
    id: "A004",
    allergen: "Peanuts",
    patient: "Sarah Wilson",
    patientId: "P004",
    severity: "Severe",
    reaction: "Anaphylaxis",
    notes: "Carries EpiPen at all times",
    dateReported: "2023-12-10",
    reportedBy: "Dr. Sarah Smith",
  },
  {
    id: "A005",
    allergen: "Sulfa drugs",
    patient: "Sarah Wilson",
    patientId: "P004",
    severity: "Moderate",
    reaction: "Rash, fever",
    notes: "Avoid sulfonamide antibiotics",
    dateReported: "2023-12-10",
    reportedBy: "Dr. Sarah Smith",
  },
  {
    id: "A006",
    allergen: "Codeine",
    patient: "David Brown",
    patientId: "P005",
    severity: "Mild",
    reaction: "Nausea, dizziness",
    notes: "Use alternative pain medications",
    dateReported: "2024-01-05",
    reportedBy: "Dr. Michael Brown",
  },
]

export default function AllergiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedAllergy, setSelectedAllergy] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const filteredAllergies = mockAllergies.filter(
    (allergy) =>
      allergy.allergen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allergy.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allergy.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allergy.reaction.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (allergy: any) => {
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
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-accent hover:bg-accent/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Allergy
        </Button>
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
            {filteredAllergies.length} allerg{filteredAllergies.length !== 1 ? "ies" : "y"} found
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Add Allergy Dialog */}
      <AllergyDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      {/* Edit Allergy Dialog */}
      <AllergyDialog allergy={selectedAllergy} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
    </div>
  )
}
