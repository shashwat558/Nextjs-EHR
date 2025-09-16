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

interface FhirHumanName {
  family?: string
  given?: string[]
}

interface FhirTelecom {
  system: "phone" | "email"
  value: string
  use?: string
}

interface FhirAddress {
  line?: string[]
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

export interface FhirPatient {
  name?: FhirHumanName[]
  gender?: string
  birthDate?: string
  telecom?: FhirTelecom[]
  address?: FhirAddress[]
  status?: string
  emergencyContact?: unknown
}

interface PatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient?: FhirPatient
  onPatientCreated?: () => void
}

export function PatientDialog({ open, onOpenChange, patient, onPatientCreated }: PatientDialogProps) {
  interface FormData {
    givenName: string
    familyName: string
    gender: string
    birthDate: string
    email: string
    phone: string
    addressLine: string
    addressCity: string
    addressState: string
    addressPostalCode: string
    addressCountry: string
    emergencyContact: string
    status: string
  }

  const [formData, setFormData] = useState<FormData>({
    givenName: patient?.name?.[0]?.given?.[0] || "",
    familyName: patient?.name?.[0]?.family || "",
    gender: patient?.gender || "",
    birthDate: patient?.birthDate || "",
    email: patient?.telecom?.find((t: FhirTelecom) => t.system === "email")?.value || "",
    phone: patient?.telecom?.find((t: FhirTelecom) => t.system === "phone")?.value || "",
    addressLine: patient?.address?.[0]?.line?.[0] || "",
    addressCity: patient?.address?.[0]?.city || "",
    addressState: patient?.address?.[0]?.state || "",
    addressPostalCode: patient?.address?.[0]?.postalCode || "",
    addressCountry: patient?.address?.[0]?.country || "",
    emergencyContact: (patient?.emergencyContact as string) || "",
    status: patient?.status || "Active",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const patientResource = {
      resourceType: "Patient",
      name: [
        {
          family: formData.familyName,
          given: [formData.givenName],
        },
      ],
      ...(formData.gender && { gender: formData.gender }),
      ...(formData.birthDate && { birthDate: formData.birthDate }),
      telecom: [
        ...(formData.phone ? [{ system: "phone", value: formData.phone, use: "mobile" }] : []),
        ...(formData.email ? [{ system: "email", value: formData.email }] : []),
      ],
      address: [
        {
          ...(formData.addressLine ? { line: [formData.addressLine] } : {}),
          ...(formData.addressCity ? { city: formData.addressCity } : {}),
          ...(formData.addressState ? { state: formData.addressState } : {}),
          ...(formData.addressPostalCode ? { postalCode: formData.addressPostalCode } : {}),
          ...(formData.addressCountry ? { country: formData.addressCountry } : {}),
        },
      ],
      ...(formData.status && { active: String(formData.status).toLowerCase() === "active" }),
    }

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: {
          accept: "application/fhir+json",
          "content-type": "application/fhir+json",
        },
        body: JSON.stringify(patientResource),
      })

      if (!res.ok) {
        console.error("Failed to create patient", await res.text())
      } else {
        // Patient created successfully, refresh the list
        onPatientCreated?.()
      }
    } catch (error) {
      console.error("Error creating patient:", error)
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
          <DialogTitle>{patient ? "Edit Patient" : "Add New Patient"}</DialogTitle>
          <DialogDescription>
            {patient ? "Update patient information below." : "Enter patient information to create a new record."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="givenName">Given Name</Label>
                <Input
                  id="givenName"
                  value={formData.givenName}
                  onChange={(e) => handleInputChange("givenName", e.target.value)}
                  placeholder="Enter given name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="familyName">Family Name</Label>
                <Input
                  id="familyName"
                  value={formData.familyName}
                  onChange={(e) => handleInputChange("familyName", e.target.value)}
                  placeholder="Enter family name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Date of Birth</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange("birthDate", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine">Address Line</Label>
              <Textarea
                id="addressLine"
                value={formData.addressLine}
                onChange={(e) => handleInputChange("addressLine", e.target.value)}
                placeholder="Street address"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addressCity">City</Label>
                <Input
                  id="addressCity"
                  value={formData.addressCity}
                  onChange={(e) => handleInputChange("addressCity", e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressState">State</Label>
                <Input
                  id="addressState"
                  value={formData.addressState}
                  onChange={(e) => handleInputChange("addressState", e.target.value)}
                  placeholder="State"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addressPostalCode">Postal Code</Label>
                <Input
                  id="addressPostalCode"
                  value={formData.addressPostalCode}
                  onChange={(e) => handleInputChange("addressPostalCode", e.target.value)}
                  placeholder="Postal Code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressCountry">Country</Label>
                <Input
                  id="addressCountry"
                  value={formData.addressCountry}
                  onChange={(e) => handleInputChange("addressCountry", e.target.value)}
                  placeholder="Country"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency">Emergency Contact</Label>
                <Input
                  id="emergency"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  placeholder="Name - Phone Number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90">
              {patient ? "Update Patient" : "Add Patient"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
