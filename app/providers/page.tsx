"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, UserCheck, Phone, Mail, Calendar } from "lucide-react"
import { ProviderDialog } from "@/components/provider-dialog"

// Mock provider data
const mockProviders = [
  {
    id: "PR001",
    name: "Dr. Sarah Smith",
    specialty: "Internal Medicine",
    email: "sarah.smith@healthcare.com",
    phone: "(555) 123-4567",
    license: "MD12345",
    status: "Active",
    joinDate: "2020-03-15",
    patientsCount: 156,
    appointmentsToday: 8,
  },
  {
    id: "PR002",
    name: "Dr. Michael Brown",
    specialty: "Orthopedics",
    email: "michael.brown@healthcare.com",
    phone: "(555) 234-5678",
    license: "MD23456",
    status: "Active",
    joinDate: "2019-08-22",
    patientsCount: 98,
    appointmentsToday: 6,
  },
  {
    id: "PR003",
    name: "Dr. Jennifer Wilson",
    specialty: "Pediatrics",
    email: "jennifer.wilson@healthcare.com",
    phone: "(555) 345-6789",
    license: "MD34567",
    status: "Active",
    joinDate: "2021-01-10",
    patientsCount: 203,
    appointmentsToday: 12,
  },
  {
    id: "PR004",
    name: "Dr. Robert Davis",
    specialty: "Cardiology",
    email: "robert.davis@healthcare.com",
    phone: "(555) 456-7890",
    license: "MD45678",
    status: "On Leave",
    joinDate: "2018-11-05",
    patientsCount: 87,
    appointmentsToday: 0,
  },
]

export default function ProvidersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const filteredProviders = mockProviders.filter(
    (provider) =>
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.license.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (provider: any) => {
    setSelectedProvider(provider)
    setIsEditDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "On Leave":
        return "bg-yellow-100 text-yellow-800"
      case "Inactive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Providers</h1>
          <p className="text-muted-foreground">Manage healthcare providers and staff</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-accent hover:bg-accent/90">
          <Plus className="mr-2 h-4 w-4" />
          Add Provider
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Search Providers</CardTitle>
          <CardDescription>Search by name, specialty, email, or license number</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Providers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Directory</CardTitle>
          <CardDescription>
            {filteredProviders.length} provider{filteredProviders.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Patients</TableHead>
                <TableHead>Today's Appointments</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProviders.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="font-medium">{provider.name}</div>
                        <div className="text-sm text-muted-foreground">{provider.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{provider.specialty}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {provider.email}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {provider.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{provider.license}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(provider.status)}>{provider.status}</Badge>
                  </TableCell>
                  <TableCell>{provider.patientsCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {provider.appointmentsToday}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(provider)} className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit provider</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete provider</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Provider Dialog */}
      <ProviderDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      {/* Edit Provider Dialog */}
      <ProviderDialog provider={selectedProvider} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
    </div>
  )
}
