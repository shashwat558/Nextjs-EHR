"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar, Plus, Filter, Clock, User, UserCheck, Search } from "lucide-react"
import { AppointmentDialog } from "@/components/appointment-dialog"
import { RescheduleDialog } from "@/components/reschedule-dialog"

// Mock appointment data
const mockAppointments = [
  {
    id: "A001",
    date: "2024-01-15",
    time: "09:00",
    patient: "John Doe",
    patientId: "P001",
    provider: "Dr. Sarah Smith",
    type: "Consultation",
    status: "Confirmed",
    duration: 30,
    notes: "Follow-up for hypertension",
  },
  {
    id: "A002",
    date: "2024-01-15",
    time: "10:30",
    patient: "Jane Smith",
    patientId: "P002",
    provider: "Dr. Sarah Smith",
    type: "Follow-up",
    status: "Confirmed",
    duration: 15,
    notes: "Asthma check-up",
  },
  {
    id: "A003",
    date: "2024-01-15",
    time: "11:15",
    patient: "Mike Johnson",
    patientId: "P003",
    provider: "Dr. Michael Brown",
    type: "Check-up",
    status: "Pending",
    duration: 30,
    notes: "Annual physical examination",
  },
  {
    id: "A004",
    date: "2024-01-15",
    time: "14:00",
    patient: "Sarah Wilson",
    patientId: "P004",
    provider: "Dr. Sarah Smith",
    type: "Consultation",
    status: "Confirmed",
    duration: 45,
    notes: "Initial consultation for allergies",
  },
  {
    id: "A005",
    date: "2024-01-15",
    time: "15:30",
    patient: "David Brown",
    patientId: "P005",
    provider: "Dr. Michael Brown",
    type: "Follow-up",
    status: "Confirmed",
    duration: 20,
    notes: "Back pain follow-up",
  },
  {
    id: "A006",
    date: "2024-01-16",
    time: "09:30",
    patient: "Emily Davis",
    patientId: "P006",
    provider: "Dr. Sarah Smith",
    type: "Consultation",
    status: "Cancelled",
    duration: 30,
    notes: "Patient requested cancellation",
  },
]

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
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)

  const filteredAppointments = mockAppointments.filter((appointment) => {
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

  const handleReschedule = (appointment: any) => {
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
        <Button onClick={() => setIsBookDialogOpen(true)} className="bg-accent hover:bg-accent/90">
          <Plus className="mr-2 h-4 w-4" />
          Book Appointment
        </Button>
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
            {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Book Appointment Dialog */}
      <AppointmentDialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen} />

      {/* Reschedule Dialog */}
      <RescheduleDialog
        appointment={selectedAppointment}
        open={isRescheduleDialogOpen}
        onOpenChange={setIsRescheduleDialogOpen}
      />
    </div>
  )
}
