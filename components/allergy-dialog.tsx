"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AllergyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  allergy?: any
}

const mockPatients = [
  { id: "P001", name: "John Doe" },
  { id: "P002", name: "Jane Smith" },
  { id: "P003", name: "Mike Johnson" },
  { id: "P004", name: "Sarah Wilson" },
  { id: "P005", name: "David Brown" },
]

const providers = ["Dr. Sarah Smith", "Dr. Michael Brown", "Dr. Jennifer Wilson"]
const severityLevels = ["Mild", "Moderate", "Severe"]

export function AllergyDialog({ open, onOpenChange, allergy }: AllergyDialogProps) {
  const [formData, setFormData] = useState({
    allergen: allergy?.allergen || "",
    patientId: allergy?.patientId || "",
    severity: allergy?.severity || "",
    reaction: allergy?.reaction || "",
    notes: allergy?.notes || "",
    dateReported: allergy?.dateReported || "",
    reportedBy: allergy?.reportedBy || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Allergy saved:", formData)
    onOpenChange(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{allergy ? "Edit Allergy" : "Add New Allergy"}</DialogTitle>
          <DialogDescription>
            {allergy ? "Update allergy information below." : "Enter allergy details to create a new record."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="allergen">Allergen</Label>
                <Input
                  id="allergen"
                  value={formData.allergen}
                  onChange={(e) => handleInputChange("allergen", e.target.value)}
                  placeholder="Enter allergen name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient">Patient</Label>
                <Select value={formData.patientId} onValueChange={(value) => handleInputChange("patientId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPatients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} ({patient.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select value={formData.severity} onValueChange={(value) => handleInputChange("severity", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    {severityLevels.map((severity) => (
                      <SelectItem key={severity} value={severity}>
                        {severity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reaction">Reaction</Label>
                <Input
                  id="reaction"
                  value={formData.reaction}
                  onChange={(e) => handleInputChange("reaction", e.target.value)}
                  placeholder="Describe the reaction"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateReported">Date Reported</Label>
                <Input
                  id="dateReported"
                  type="date"
                  value={formData.dateReported}
                  onChange={(e) => handleInputChange("dateReported", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reportedBy">Reported By</Label>
                <Select value={formData.reportedBy} onValueChange={(value) => handleInputChange("reportedBy", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Additional notes or precautions"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90">
              {allergy ? "Update Allergy" : "Add Allergy"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
