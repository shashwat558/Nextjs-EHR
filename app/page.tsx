"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, AlertTriangle, Activity, TrendingUp, Clock, CheckCircle, Loader2, RefreshCw } from "lucide-react"

interface DashboardStats {
  totalPatients: number
  todaysAppointments: number
  criticalAllergies: number
  activeCases: number
}

interface UpcomingAppointment {
  id: string
  time: string
  patient: string
  type: string
  status: string
  priority: string
  date: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todaysAppointments: 0,
    criticalAllergies: 0,
    activeCases: 0
  })
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)

      // Fetch all data in parallel
      const [patientsRes, appointmentsRes, allergiesRes] = await Promise.all([
        fetch('/api/patients?_count=50', { headers: { 'accept': 'application/json' } }),
        fetch('/api/appointments?_count=50', { headers: { 'accept': 'application/json' } }),
        fetch('/api/allergies?_count=50', { headers: { 'accept': 'application/json' } })
      ])

      // Process patients data
      const patientsData = await patientsRes.json()
      let patientsCount = 0
      if (patientsData.entry && Array.isArray(patientsData.entry)) {
        patientsCount = patientsData.entry.length
      } else if (Array.isArray(patientsData)) {
        patientsCount = patientsData.length
      }

      // Process appointments data
      const appointmentsData = await appointmentsRes.json()
      let appointments: Record<string, unknown>[] = []
      if (appointmentsData.entry && Array.isArray(appointmentsData.entry)) {
        appointments = appointmentsData.entry.map((entry: Record<string, unknown>) => entry.resource as Record<string, unknown>)
      } else if (Array.isArray(appointmentsData)) {
        appointments = appointmentsData as Record<string, unknown>[]
      }

      // Get today's appointments
      const today = new Date().toISOString().split('T')[0]
      const todaysAppointments = appointments.filter((appt: Record<string, unknown>) => {
        const apptDate = appt.date as string || appt.start as string
        return apptDate && apptDate.includes(today)
      })

      // Process upcoming appointments (next 5)
      const upcoming = appointments
        .filter((appt: Record<string, unknown>) => {
          const apptDate = appt.date as string || appt.start as string
          return apptDate && new Date(apptDate) >= new Date()
        })
        .sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
          const dateA = new Date(a.date as string || a.start as string)
          const dateB = new Date(b.date as string || b.start as string)
          return dateA.getTime() - dateB.getTime()
        })
        .slice(0, 5)
        .map((appt: Record<string, unknown>) => {
          const apptDate = appt.date as string || appt.start as string
          const apptTime = appt.time as string || appt.start as string
          const patientRef = appt.patient as string
          const participantActor = (appt.participant as Record<string, unknown>[])?.find((p: Record<string, unknown>) => 
            (p.actor as Record<string, unknown>)?.reference?.toString().includes('Patient')
          )?.actor as Record<string, unknown> | undefined
          const patientDisplay = patientRef || (participantActor?.display as string) || 'Unknown'

          return {
            id: (appt.id as string) || 'N/A',
            time: apptTime ? new Date(apptTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
            patient: patientDisplay,
            type: (appt.type as string) || ((appt.appointmentType as Record<string, unknown>)?.coding as Record<string, unknown>[] || [])[0]?.display as string || 'Unknown',
            status: (appt.status as string) || 'Unknown',
            priority: (appt.priority as string) || 'normal',
            date: apptDate
          }
        })

      // Process allergies data
      const allergiesData = await allergiesRes.json()
      let allergies: Record<string, unknown>[] = []
      if (allergiesData.entry && Array.isArray(allergiesData.entry)) {
        allergies = allergiesData.entry.map((entry: Record<string, unknown>) => entry.resource as Record<string, unknown>)
      } else if (Array.isArray(allergiesData)) {
        allergies = allergiesData as Record<string, unknown>[]
      }

      // Count critical allergies (severe)
      const criticalAllergies = allergies.filter((allergy: Record<string, unknown>) => {
        const reactions = (allergy.reaction as Record<string, unknown>[]) || []
        return reactions.some((reaction: Record<string, unknown>) => 
          (reaction.severity as string)?.toLowerCase() === 'severe'
        )
      }).length

      // Update stats
      setStats({
        totalPatients: patientsCount,
        todaysAppointments: todaysAppointments.length,
        criticalAllergies: criticalAllergies,
        activeCases: appointments.filter((appt: Record<string, unknown>) => 
          (appt.status as string)?.toLowerCase() === 'confirmed' || 
          (appt.status as string)?.toLowerCase() === 'pending'
        ).length
      })

      setUpcomingAppointments(upcoming)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchDashboardData()
    setIsRefreshing(false)
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-lg text-muted-foreground">Welcome back, Dr. Smith. Here&apos;s what&apos;s happening today.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Total Patients
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.totalPatients}
            </div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600 font-medium">Active</span>
              <span className="text-muted-foreground">patients</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Today&apos;s Appointments
            </CardTitle>
            <div className="p-2 bg-accent/10 rounded-lg">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.todaysAppointments}
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Clock className="h-3 w-3 text-blue-600" />
              <span className="text-blue-600 font-medium">Scheduled</span>
              <span className="text-muted-foreground">today</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Critical Allergies
            </CardTitle>
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.criticalAllergies}
            </div>
            <div className="flex items-center gap-1 text-sm">
              <AlertTriangle className="h-3 w-3 text-orange-600" />
              <span className="text-orange-600 font-medium">Severe</span>
              <span className="text-muted-foreground">allergies</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Active Cases
            </CardTitle>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold text-foreground">
              {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : stats.activeCases}
            </div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600 font-medium">Active</span>
              <span className="text-muted-foreground">appointments</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">Upcoming Appointments</CardTitle>
              <CardDescription className="text-base mt-1">Your next 5 appointments for today</CardDescription>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              {upcomingAppointments.length} appointment{upcomingAppointments.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2 text-muted-foreground">Loading appointments...</span>
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No upcoming appointments found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r from-card to-muted/20 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-16 h-16 bg-muted/30 rounded-lg border">
                    <div className="text-sm font-bold text-foreground">{appointment.time}</div>
                    <div className="text-xs text-foreground/70">AM/PM</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-foreground">{appointment.patient}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{appointment.type}</span>
                      {appointment.priority === "high" && (
                        <Badge variant="destructive" className="text-xs px-2 py-0">
                          High Priority
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {appointment.status === "Confirmed" ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Confirmed
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 flex items-center gap-1"
                    >
                      <Clock className="h-3 w-3" />
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}