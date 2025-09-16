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

interface AllergyFormData {
  id?: string
  allergen?: string
  patient?: string
  patientId?: string
  severity?: string
  reaction?: string
  notes?: string
  dateReported?: string
  reportedBy?: string
}

interface AllergyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  allergy?: AllergyFormData | null
  onAllergyCreated?: () => void
}

const mockPatients = [
  { id: "P001", name: "John Doe" },
  { id: "P002", name: "Jane Smith" },
  { id: "P003", name: "Mike Johnson" },
  { id: "P004", name: "Sarah Wilson" },
  { id: "P005", name: "David Brown" },
]

const providers = ["Dr. Sarah Smith", "Dr. Michael Brown", "Dr. Jennifer Wilson"]
const severityLevels = ["mild", "moderate", "severe"]
const manifestationOptions = [
  "Anaphylaxis",
  "Angioedema", 
  "Diarrhea",
  "Dizziness",
  "Fatigue",
  "GI upset",
  "Hives",
  "Liver toxicity",
  "Nausea",
  "Rash",
  "Shortness of breath",
  "Swelling",
  "Weal",
  "Other"
]

export function AllergyDialog({ open, onOpenChange, allergy, onAllergyCreated }: AllergyDialogProps) {
  const [formData, setFormData] = useState({
    allergen: allergy?.allergen || "",
    patientId: allergy?.patientId || "",
    severity: allergy?.severity || "",
    reaction: allergy?.reaction || "",
    notes: allergy?.notes || "",
    dateReported: allergy?.dateReported || "",
    reportedBy: allergy?.reportedBy || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Build FHIR AllergyIntolerance payload
    const payload = {
      clinicalStatus: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical", code: "active", display: "Active" }] },
      code: { text: formData.allergen },
      patient: { reference: `Patient/${formData.patientId}` },
      onsetDateTime: formData.dateReported || new Date().toISOString().split('T')[0],
      recordedDate: formData.dateReported || new Date().toISOString(),
      reaction: [{
        severity: formData.severity,
        manifestation: formData.reaction
      }],
      ...(formData.notes && { note: [{ text: formData.notes }] })
    }

    try {
      const res = await fetch('/api/allergies', {
        method: 'POST',
        headers: {
          accept: 'application/fhir+json',
          'content-type': 'application/fhir+json',
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const text = await res.text()
        console.error('Failed to create allergy', text)
      } else {
        onAllergyCreated?.()
      }
    } catch (error) {
      console.error('Error creating allergy:', error)
    } finally {
      onOpenChange(false)
    }
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
                <Select value={formData.reaction} onValueChange={(value) => handleInputChange("reaction", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reaction type" />
                  </SelectTrigger>
                  <SelectContent>
                    {manifestationOptions.map((manifestation) => (
                      <SelectItem key={manifestation} value={manifestation}>
                        {manifestation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
