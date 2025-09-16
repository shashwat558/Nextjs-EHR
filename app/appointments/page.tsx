"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar, Plus, Filter, Clock, User, UserCheck, Search, RefreshCw } from "lucide-react"
import { AppointmentDialog } from "@/components/appointment-dialog"
import { RescheduleDialog } from "@/components/reschedule-dialog"
import { SlotSearchDialog } from "@/components/slot-search-dialog"

interface AppointmentUI {
  id: string
  date: string
  time: string
  patient: string
  patientId: string
  provider: string
  type: string
  status: string
  duration: number
  notes: string
}

const providers = ["All Providers", "Dr. Sarah Smith", "Dr. Michael Brown", "Dr. Jennifer Wilson"]
const appointmentTypes = ["All Types", "Consultation", "Follow-up", "Check-up", "Emergency"]
const statusOptions = ["All Status", "Confirmed", "Pending", "Cancelled", "Completed"]

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState("2024-01-15")
  const [selectedProvider, setSelectedProvider] = useState("All Providers")
  const [selectedType, setSelectedType] = useState("All Types")
  const [selectedStatus, setSelectedStatus] = useState("All Status")
  const [searchTerm, setSearchTerm] = useState("")
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentUI | null>(null)
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)
  const [isSlotSearchOpen, setIsSlotSearchOpen] = useState(false)
  const [appointments, setAppointments] = useState<AppointmentUI[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchAppointments = async () => {
    try {
      setIsLoading(true)

      const res = await fetch('/api/appointments?_count=50', {
        headers: { 'accept': 'application/json' }
      })
      if (!res.ok) throw new Error(`Failed to fetch appointments: ${res.status}`)
      const data = await res.json()

      // Handle both FHIR format (data.entry) and simple array format
      let appointmentsData: Record<string, unknown>[] = []
      
      if (data.entry && Array.isArray(data.entry)) {
        // FHIR format
        appointmentsData = data.entry.map((entry: Record<string, unknown>) => entry.resource as Record<string, unknown>)
      } else if (Array.isArray(data)) {
        // Simple array format
        appointmentsData = data as Record<string, unknown>[]
      }

      if (appointmentsData.length > 0) {
        const transformed: AppointmentUI[] = appointmentsData.map((appt: Record<string, unknown>) => {
          // Check if it's already in UI format or needs transformation
          if (appt.id && appt.date && appt.time && appt.patient && appt.provider) {
            // Already in UI format
            return {
              id: appt.id as string,
              date: appt.date as string,
              time: appt.time as string,
              patient: appt.patient as string,
              patientId: appt.patientId as string,
              provider: appt.provider as string,
              type: appt.type as string,
              status: appt.status as string,
              duration: appt.duration as number,
              notes: appt.notes as string,
            }
          } else {
            // FHIR format - transform it
            const start = (appt.start as string) || ''
            const date = start ? new Date(start) : null
            const participants = (appt.participant as Record<string, unknown>[]) || []
            const patientPart = participants.find((p: Record<string, unknown>) => String((p.actor as Record<string, unknown>)?.reference || '').startsWith('Patient/'))
            const practitionerPart = participants.find((p: Record<string, unknown>) => String((p.actor as Record<string, unknown>)?.reference || '').startsWith('Practitioner/'))

            return {
              id: (appt.id as string) || 'N/A',
              date: date ? date.toISOString().slice(0, 10) : 'N/A',
              time: date ? date.toISOString().slice(11, 16) : 'N/A',
              patient: ((patientPart?.actor as Record<string, unknown>)?.display as string) || 'Unknown',
              patientId: String((patientPart?.actor as Record<string, unknown>)?.reference || '').replace('Patient/', '') || 'N/A',
              provider: ((practitionerPart?.actor as Record<string, unknown>)?.display as string) || 'Unknown',
              type: ((appt.appointmentType as Record<string, unknown>)?.text as string) || ((((appt.appointmentType as Record<string, unknown>)?.coding as Record<string, unknown>[])?.[0] as Record<string, unknown>)?.display as string) || 'N/A',
              status: (appt.status as string) ? (appt.status as string).charAt(0).toUpperCase() + (appt.status as string).slice(1) : 'Pending',
              duration: (appt.minutesDuration as number) || 0,
              notes: (appt.description as string) || '',
            }
          }
        })
        setAppointments(transformed)
      } else {
        setAppointments([])
      }
    } catch (err) {
      console.error('Error fetching appointments:', err)
      setAppointments([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesDate = selectedDate === "all" || appointment.date === selectedDate
    const matchesProvider = selectedProvider === "All Providers" || appointment.provider === selectedProvider
    const matchesType = selectedType === "All Types" || appointment.type === selectedType
    const matchesStatus = selectedStatus === "All Status" || appointment.status === selectedStatus
    const matchesSearch =
      searchTerm === "" ||
      appointment.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patientId.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesDate && matchesProvider && matchesType && matchesStatus && matchesSearch
  })

  const handleReschedule = (appointment: AppointmentUI) => {
    setSelectedAppointment(appointment)
    setIsRescheduleDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      case "Completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Manage patient appointments and scheduling</p>
        </div>
        <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon"
          onClick={async () => { setIsRefreshing(true); await fetchAppointments(); setIsRefreshing(false) }}
          className="h-9 w-9"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh appointments</span>
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setIsSlotSearchOpen(true)}
          className="h-9"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Search Slots
        </Button>
        <Button onClick={() => setIsBookDialogOpen(true)} className="bg-accent hover:bg-accent/90">
          <Plus className="mr-2 h-4 w-4" />
          Book Appointment
        </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter appointments by date, provider, type, and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Provider</label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
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
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search patient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Appointment Schedule</CardTitle>
          <CardDescription>
            {isLoading ? "Loading appointments..." : `${filteredAppointments.length} appointment${filteredAppointments.length !== 1 ? "s" : ""} found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground py-8">Loading appointment schedule...</div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{new Date(appointment.date).toLocaleDateString()}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {appointment.time}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{appointment.patient}</div>
                        <div className="text-sm text-muted-foreground">{appointment.patientId}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                      {appointment.provider}
                    </div>
                  </TableCell>
                  <TableCell>{appointment.type}</TableCell>
                  <TableCell>{appointment.duration} min</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{appointment.notes}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReschedule(appointment)}
                        disabled={appointment.status === "Cancelled"}
                      >
                        Reschedule
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive bg-transparent"
                        disabled={appointment.status === "Cancelled"}
                      >
                        Cancel
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

      {/* Book Appointment Dialog */}
      <AppointmentDialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen} onAppointmentCreated={fetchAppointments} />

      {/* Reschedule Dialog */}
      <RescheduleDialog
        appointment={selectedAppointment}
        open={isRescheduleDialogOpen}
        onOpenChange={setIsRescheduleDialogOpen}
      />

      {/* Slot Search Dialog */}
      <SlotSearchDialog
        open={isSlotSearchOpen}
        onOpenChange={setIsSlotSearchOpen}
        onSlotSelected={(slot) => {
          console.log('Selected slot:', slot)
          // You can add logic here to pre-fill the appointment form with slot data
        }}
      />
    </div>
  )
}
