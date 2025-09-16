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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

interface AppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment?: {
    id?: string
    patientId?: string
    provider?: string
    date?: string
    time?: string
    type?: string
    duration?: string
    status?: string
    notes?: string
  }
  onAppointmentCreated?: () => void
}

const mockPatients = [
  { id: "P001", name: "John Doe" },
  { id: "P002", name: "Jane Smith" },
  { id: "P003", name: "Mike Johnson" },
  { id: "P004", name: "Sarah Wilson" },
  { id: "P005", name: "David Brown" },
]

const providers = ["Dr. Sarah Smith", "Dr. Michael Brown", "Dr. Jennifer Wilson"]
const appointmentTypes = ["Consultation", "Follow-up", "Check-up", "Emergency"]

export function AppointmentDialog({ open, onOpenChange, appointment, onAppointmentCreated }: AppointmentDialogProps) {
  const [formData, setFormData] = useState({
    patientId: appointment?.patientId || "",
    provider: appointment?.provider || "",
    date: appointment?.date || "",
    time: appointment?.time || "",
    type: appointment?.type || "",
    duration: appointment?.duration || "30",
    status: appointment?.status || "booked",
    notes: appointment?.notes || "",
    reportableReason: "",
    supportingInformation: "",
    comment: "",
  })
  const [hasConflict, setHasConflict] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setHasConflict(false)

    // Build FHIR Appointment payload
    const startIso = `${formData.date}T${formData.time}:00Z`
    const minutesDuration = parseInt(formData.duration, 10) || 30
    
    // Calculate end time if not provided
    const startDate = new Date(startIso)
    const endDate = new Date(startDate.getTime() + minutesDuration * 60000)
    const endIso = endDate.toISOString()
    
    const payload = {
      participant: [
        { reference: `Patient/${formData.patientId}` },
        { reference: `Practitioner/${formData.provider}` }
      ],
      appointmentType: { text: formData.type },
      start: startIso,
      end: endIso,
      minutesDuration,
      status: formData.status,
      description: formData.notes || undefined,
      ...(formData.reportableReason && { reportableReason: formData.reportableReason }),
      ...(formData.supportingInformation && { supportingInformation: formData.supportingInformation }),
      ...(formData.comment && { comment: formData.comment }),
    }

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          accept: 'application/fhir+json',
          'content-type': 'application/fhir+json',
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const text = await res.text()
        console.error('Failed to create appointment', text)
      } else {
        onAppointmentCreated?.()
      }
    } catch (error) {
      console.error('Error creating appointment:', error)
    } finally {
      onOpenChange(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === "time" || field === "date") {
      setHasConflict(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{appointment ? "Edit Appointment" : "Book New Appointment"}</DialogTitle>
          <DialogDescription>
            {appointment ? "Update appointment details below." : "Schedule a new appointment for a patient."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select value={formData.provider} onValueChange={(value) => handleInputChange("provider", value)}>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Appointment Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select value={formData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="arrived">Arrived</SelectItem>
                  <SelectItem value="fulfilled">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="noshow">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Additional notes or reason for appointment"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportableReason">Reportable Reason</Label>
              <Input
                id="reportableReason"
                value={formData.reportableReason}
                onChange={(e) => handleInputChange("reportableReason", e.target.value)}
                placeholder="Reason for reporting this appointment"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportingInformation">Supporting Information</Label>
              <Input
                id="supportingInformation"
                value={formData.supportingInformation}
                onChange={(e) => handleInputChange("supportingInformation", e.target.value)}
                placeholder="Additional supporting information"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => handleInputChange("comment", e.target.value)}
                placeholder="Additional comments"
                rows={2}
              />
            </div>

            {hasConflict && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Warning: There is a scheduling conflict at this time. Please choose a different time slot.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90">
              {appointment ? "Update Appointment" : "Book Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
