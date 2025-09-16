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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, Clock, User, Loader2 } from "lucide-react"

interface Slot {
  id: string
  start: string
  end: string
  status: string
  schedule: string
  serviceType?: string
  serviceCategory?: string
}

interface SlotSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSlotSelected?: (slot: Slot) => void
}

const appointmentTypes = [
  "Consultation",
  "Follow-up", 
  "Check-up",
  "Emergency"
]

const serviceTypes = [
  "General Practice",
  "Specialist Consultation",
  "Emergency Care",
  "Preventive Care"
]

const serviceCategories = [
  "Primary Care",
  "Specialty Care", 
  "Emergency Services",
  "Preventive Services"
]

export function SlotSearchDialog({ open, onOpenChange, onSlotSelected }: SlotSearchDialogProps) {
  const [searchParams, setSearchParams] = useState({
    appointmentType: "",
    date: "",
    serviceType: "",
    serviceCategory: "",
    status: "free"
  })
  const [slots, setSlots] = useState<Slot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchParams.appointmentType) {
      setError("Appointment type is required")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const queryParams = new URLSearchParams({
        "appointment-type": searchParams.appointmentType,
        ...(searchParams.date && { date: searchParams.date }),
        ...(searchParams.serviceType && { "service-type": searchParams.serviceType }),
        ...(searchParams.serviceCategory && { "service-category": searchParams.serviceCategory }),
        ...(searchParams.status && { status: searchParams.status }),
        _count: "50"
      })

      const res = await fetch(`/api/appointments/slots?${queryParams}`, {
        headers: { 'accept': 'application/json' }
      })

      if (!res.ok) {
        throw new Error(`Failed to fetch slots: ${res.status}`)
      }

      const data = await res.json()

      // Handle FHIR Bundle format
      let slotsData: Record<string, unknown>[] = []
      
      if (data.entry && Array.isArray(data.entry)) {
        slotsData = data.entry.map((entry: Record<string, unknown>) => entry.resource as Record<string, unknown>)
      } else if (Array.isArray(data)) {
        slotsData = data as Record<string, unknown>[]
      }

      const transformedSlots: Slot[] = slotsData.map((slot: Record<string, unknown>) => ({
        id: (slot.id as string) || 'N/A',
        start: (slot.start as string) || 'N/A',
        end: (slot.end as string) || 'N/A',
        status: (slot.status as string) || 'Unknown',
        schedule: (slot.schedule as Record<string, unknown>)?.reference as string || 'Unknown',
        serviceType: ((((slot.serviceType as Record<string, unknown>[]) || [])[0] as Record<string, unknown>)?.coding as Record<string, unknown>[] || [])[0]?.display as string,
        serviceCategory: ((((slot.serviceCategory as Record<string, unknown>[]) || [])[0] as Record<string, unknown>)?.coding as Record<string, unknown>[] || [])[0]?.display as string,
      }))

      setSlots(transformedSlots)
    } catch (err) {
      console.error('Error fetching slots:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch slots')
      setSlots([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSlotSelect = (slot: Slot) => {
    onSlotSelected?.(slot)
    onOpenChange(false)
  }

  const formatDateTime = (dateTime: string) => {
    if (dateTime === 'N/A') return 'N/A'
    try {
      const date = new Date(dateTime)
      return {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    } catch {
      return { date: 'Invalid Date', time: 'Invalid Time' }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "free":
        return "bg-green-100 text-green-800"
      case "busy":
        return "bg-red-100 text-red-800"
      case "busy-unavailable":
        return "bg-gray-100 text-gray-800"
      case "busy-tentative":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Available Slots</DialogTitle>
          <DialogDescription>
            Search for available appointment slots by type, date, and service category.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Search Form */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Criteria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="appointmentType">Appointment Type *</Label>
                  <Select 
                    value={searchParams.appointmentType} 
                    onValueChange={(value) => setSearchParams(prev => ({ ...prev, appointmentType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select appointment type" />
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
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={searchParams.date}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Select 
                    value={searchParams.serviceType} 
                    onValueChange={(value) => setSearchParams(prev => ({ ...prev, serviceType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceCategory">Service Category</Label>
                  <Select 
                    value={searchParams.serviceCategory} 
                    onValueChange={(value) => setSearchParams(prev => ({ ...prev, serviceCategory: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service category" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4">
                <Button onClick={handleSearch} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search Slots
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {slots.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Slots</CardTitle>
                <CardDescription>
                  {slots.length} slot{slots.length !== 1 ? 's' : ''} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {slots.map((slot) => {
                    const startFormatted = formatDateTime(slot.start)
                    const endFormatted = formatDateTime(slot.end)
                    const date = typeof startFormatted === 'string' ? startFormatted : startFormatted.date
                    const time = typeof startFormatted === 'string' ? 'N/A' : startFormatted.time
                    const endTime = typeof endFormatted === 'string' ? endFormatted : endFormatted.time
                    
                    return (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleSlotSelect(slot)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{time} - {endTime}</span>
                          </div>
                          <Badge className={getStatusColor(slot.status)}>
                            {slot.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          {slot.serviceType && (
                            <div className="text-sm text-muted-foreground">
                              {slot.serviceType}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            ID: {slot.id}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {slots.length === 0 && !isLoading && !error && (
            <Card>
              <CardContent className="py-8 text-center">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No slots found. Try adjusting your search criteria.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
