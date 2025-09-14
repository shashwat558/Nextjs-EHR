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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Calendar, Clock, User } from "lucide-react"

interface RescheduleDialogProps {
  appointment: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RescheduleDialog({ appointment, open, onOpenChange }: RescheduleDialogProps) {
  const [newDate, setNewDate] = useState("")
  const [newTime, setNewTime] = useState("")
  const [hasConflict, setHasConflict] = useState(false)

  if (!appointment) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate conflict check
    if (newTime === "10:00" && newDate === "2024-01-15") {
      setHasConflict(true)
      return
    }
    setHasConflict(false)
    console.log("Appointment rescheduled:", { ...appointment, date: newDate, time: newTime })
    onOpenChange(false)
  }

  const handleTimeChange = (time: string) => {
    setNewTime(time)
    setHasConflict(false)
  }

  const handleDateChange = (date: string) => {
    setNewDate(date)
    setHasConflict(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>Select a new date and time for this appointment.</DialogDescription>
        </DialogHeader>

        {/* Current Appointment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Appointment</CardTitle>
            <CardDescription>Details of the appointment being rescheduled</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{appointment.patient}</span>
              <span className="text-muted-foreground">({appointment.patientId})</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(appointment.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.time}</span>
              <span className="text-muted-foreground">({appointment.duration} min)</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">Type:</span> {appointment.type}
            </div>
            <div className="text-sm">
              <span className="font-medium">Provider:</span> {appointment.provider}
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-date">New Date</Label>
                <Input
                  id="new-date"
                  type="date"
                  value={newDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-time">New Time</Label>
                <Input
                  id="new-time"
                  type="time"
                  value={newTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  required
                />
              </div>
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
              Reschedule Appointment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
