/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert } from "@/components/ui/alert"
import { Search, Plus, Edit, Trash2, UserCheck, Phone, Mail, Calendar, Eye, Loader2, RefreshCw, AlertCircle } from "lucide-react"
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

interface Provider {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  license: string;
  status: string;
  joinDate: string;
  patientsCount: number;
  appointmentsToday: number;
  gender?: string;
  birthDate?: string;
  address?: string;
  qualification?: string;
  communication?: string;
}

export default function ProvidersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [providers, setProviders] = useState<Provider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch providers from FHIR API
  const fetchProviders = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/provider?_count=50', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch providers: ${response.status}`)
      }

      const data = await response.json()
      
      // Transform FHIR data to our Provider interface
      if (data.entry && Array.isArray(data.entry)) {
        const transformedProviders = data.entry.map((entry: Record<string, unknown>) => {
          const provider = entry.resource as Record<string, unknown>
          return {
            id: (provider.id as string) || 'N/A',
            name: provider.name && Array.isArray(provider.name) && provider.name[0] 
              ? `${((provider.name[0] as Record<string, unknown>).given as string[])?.[0] || ''} ${((provider.name[0] as Record<string, unknown>).family as string) || ''}`.trim() 
              : 'N/A',
            specialty: (provider.qualification as Record<string, unknown>[])?.[0] && 
              Array.isArray(provider.qualification) && 
              //@ts-ignore
              ((provider.qualification as Record<string, unknown>[])[0] as Record<string, unknown>).code?.display as string || 'N/A',
            email: (provider.telecom as Record<string, unknown>[])?.[0] && 
              Array.isArray(provider.telecom) && 
              (provider.telecom as Record<string, unknown>[]).find((t: Record<string, unknown>) => t.system === 'email')?.value as string || 'N/A',
            phone: (provider.telecom as Record<string, unknown>[])?.[0] && 
              Array.isArray(provider.telecom) && 
              (provider.telecom as Record<string, unknown>[]).find((t: Record<string, unknown>) => t.system === 'phone')?.value as string || 'N/A',
            license: (provider.identifier as Record<string, unknown>[])?.[0] && 
              Array.isArray(provider.identifier) && 
              ((provider.identifier as Record<string, unknown>[])[0] as Record<string, unknown>).value as string || 'N/A',
            status: provider.active ? 'Active' : 'Inactive',
            joinDate: 'N/A', // This would need to be fetched separately
            patientsCount: 0, // This would need to be calculated separately
            appointmentsToday: 0, // This would need to be fetched separately
            gender: (provider.gender as string) || 'N/A',
            birthDate: (provider.birthDate as string) || 'N/A',
            address: provider.address && Array.isArray(provider.address) && provider.address[0] 
              ? `${((provider.address[0] as Record<string, unknown>).line as string[])?.[0] || ''}, ${((provider.address[0] as Record<string, unknown>).city as string) || ''}, ${((provider.address[0] as Record<string, unknown>).state as string) || ''} ${((provider.address[0] as Record<string, unknown>).postalCode as string) || ''}`.trim() 
              : 'N/A',
            qualification: (provider.qualification as Record<string, unknown>[])?.[0] && 
              Array.isArray(provider.qualification) && 
              //@ts-ignore
              ((provider.qualification as Record<string, unknown>[])[0] as Record<string, unknown>).code?.display as string || 'N/A',
            communication: (provider.communication as Record<string, unknown>[])?.[0] && 
              Array.isArray(provider.communication) && 
              //@ts-ignore
              ((provider.communication as Record<string, unknown>[])[0] as Record<string, unknown>).language?.coding?.[0]?.display as string || 'N/A',
          }
        })
        setProviders(transformedProviders)
      } else {
        // Fallback to mock data if no FHIR data
        setProviders(mockProviders)
      }
    } catch (err) {
      console.error('Error fetching providers:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch providers')
      // Fallback to mock data on error
      setProviders(mockProviders)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchProviders()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchProviders()
    setIsRefreshing(false)
  }

  const filteredProviders = providers.filter(
    (provider) =>
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.license.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewProvider = (provider: Provider) => {
    // Navigate to provider detail page (if we create one)
    router.push(`/providers/${provider.id}`)
  }

  const handleEdit = (provider: Provider) => {
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
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 w-9"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh providers</span>
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Provider
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div>
            <h4 className="font-medium">Error loading providers</h4>
            <p className="text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </Alert>
      )}

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
            {isLoading ? "Loading providers..." : `${filteredProviders.length} provider${filteredProviders.length !== 1 ? "s" : ""} found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading provider records...</p>
              </div>
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <UserCheck className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No providers found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Try adjusting your search criteria" : "Get started by adding your first provider"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Provider
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Patients</TableHead>
                  <TableHead>Today&apos;s Appointments</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProviders.map((provider) => (
                  <TableRow key={provider.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-blue-500" />
                        <div>
                          <div className="font-medium">{provider.name}</div>
                          <Badge variant="outline" className="font-mono text-xs mt-1">
                            {provider.id}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {provider.specialty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate max-w-[200px]">{provider.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{provider.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono">{provider.license}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(provider.status)}>
                        {provider.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{provider.patientsCount}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{provider.appointmentsToday}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewProvider(provider)}
                          className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View provider</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEdit(provider)}
                          className="h-8 w-8 hover:bg-orange-50 hover:text-orange-600"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit provider</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete provider</span>
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

      {/* Add Provider Dialog */}
      <ProviderDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      {/* Edit Provider Dialog */}
      <ProviderDialog provider={selectedProvider} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
    </div>
  )
}
