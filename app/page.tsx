import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, AlertTriangle, Activity, TrendingUp, Clock, CheckCircle } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-lg text-muted-foreground">Welcome back, Dr. Smith. Here&apos;s what&apos;s happening today.</p>
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
            <div className="text-3xl font-bold text-foreground">1,247</div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600 font-medium">+12</span>
              <span className="text-muted-foreground">from last month</span>
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
            <div className="text-3xl font-bold text-foreground">23</div>
            <div className="flex items-center gap-1 text-sm">
              <Clock className="h-3 w-3 text-blue-600" />
              <span className="text-blue-600 font-medium">5 remaining</span>
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
            <div className="text-3xl font-bold text-foreground">8</div>
            <div className="flex items-center gap-1 text-sm">
              <AlertTriangle className="h-3 w-3 text-orange-600" />
              <span className="text-orange-600 font-medium">Requires</span>
              <span className="text-muted-foreground">attention</span>
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
            <div className="text-3xl font-bold text-foreground">156</div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600 font-medium">+8 new</span>
              <span className="text-muted-foreground">this week</span>
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
              5 appointments
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: "9:00 AM", patient: "John Doe", type: "Consultation", status: "Confirmed", priority: "high" },
              { time: "10:30 AM", patient: "Jane Smith", type: "Follow-up", status: "Confirmed", priority: "normal" },
              { time: "11:15 AM", patient: "Mike Johnson", type: "Check-up", status: "Pending", priority: "normal" },
              { time: "2:00 PM", patient: "Sarah Wilson", type: "Consultation", status: "Confirmed", priority: "high" },
              { time: "3:30 PM", patient: "David Brown", type: "Follow-up", status: "Confirmed", priority: "normal" },
            ].map((appointment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r from-card to-muted/20 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-16 h-16 bg-muted/30 rounded-lg border">
                    <div className="text-sm font-bold text-foreground">{appointment.time.split(" ")[0]}</div>
                    <div className="text-xs text-foreground/70">{appointment.time.split(" ")[1]}</div>
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
        </CardContent>
      </Card>
    </div>
  )
}