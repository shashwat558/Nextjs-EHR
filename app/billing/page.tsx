"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert } from "@/components/ui/alert"
import { Search, Plus, Edit, Trash2, Eye, DollarSign, Calendar, User, Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { BillingDialog } from "@/components/billing-dialog"
import { useRouter } from "next/navigation"

interface ChargeItem {
  id: string
  status: string
  subject: {
    reference: string
    display: string
  }
  context?: {
    reference: string
  }
  occurrenceDateTime: string
  totalCost: {
    value: number
    currency: string
  }
  financialTransactionDetail: Array<{
    description: string
    unitCost: {
      value: number
      currency: string
    }
    quantity: {
      valueDecimal: number
    }
    code: {
      coding: Array<{
        system: string
        code: string
        display: string
      }>
    }
  }>
  note?: Array<{
    text: string
  }>
}

export default function BillingPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCharge, setSelectedCharge] = useState<ChargeItem | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [charges, setCharges] = useState<ChargeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchCharges = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch('/api/billing?_count=50', {
        headers: { 'accept': 'application/json' }
      })
      if (!res.ok) throw new Error(`Failed to fetch charges: ${res.status}`)
      const data = await res.json()

      // Handle both FHIR format (data.entry) and simple array format
      let chargesData: Record<string, unknown>[] = []
      
      if (data.entry && Array.isArray(data.entry)) {
        // FHIR format
        chargesData = data.entry.map((entry: Record<string, unknown>) => entry.resource as Record<string, unknown>)
      } else if (Array.isArray(data)) {
        // Simple array format
        chargesData = data as Record<string, unknown>[]
      }

      if (chargesData.length > 0) {
        const transformed: ChargeItem[] = chargesData.map((charge: Record<string, unknown>) => ({
          id: (charge.id as string) || 'N/A',
          status: (charge.status as string) || 'Unknown',
          subject: (charge.subject as { reference: string; display: string }) || { reference: 'N/A', display: 'Unknown' },
          context: (charge.context as { reference: string }) || undefined,
          occurrenceDateTime: (charge.occurrenceDateTime as string) || 'N/A',
          totalCost: (charge.totalCost as { value: number; currency: string }) || { value: 0, currency: 'USD' },
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          financialTransactionDetail: (charge.financialTransactionDetail as any[]) || [],
          note: (charge.note as Array<{ text: string }>) || undefined,
        }))
        setCharges(transformed)
      } else {
        setCharges([])
      }
    } catch (err) {
      console.error('Error fetching charges:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch charges')
      setCharges([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCharges()
  }, [])

  const filteredCharges = charges.filter(
    (charge) =>
      charge.subject.display.toLowerCase().includes(searchTerm.toLowerCase()) ||
      charge.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      charge.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      charge.financialTransactionDetail.some(detail => 
        detail.description.toLowerCase().includes(searchTerm.toLowerCase())
      ),
  )

  const handleViewCharge = (charge: ChargeItem) => {
    router.push(`/billing/${charge.id}`)
  }

  const handleEdit = (charge: ChargeItem) => {
    setSelectedCharge(charge)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (chargeId: string) => {
    if (confirm('Are you sure you want to delete this charge? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/billing/${chargeId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          await fetchCharges() // Refresh the list
        } else {
          throw new Error('Failed to delete charge')
        }
      } catch (err) {
        console.error('Error deleting charge:', err)
        setError('Failed to delete charge')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "billable":
        return "bg-green-100 text-green-800"
      case "inbound":
        return "bg-blue-100 text-blue-800"
      case "billed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(value)
  }

  const formatDateTime = (dateTime: string) => {
    if (dateTime === 'N/A') return 'N/A'
    try {
      return new Date(dateTime).toLocaleString()
    } catch {
      return 'Invalid Date'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">Manage charges and billing items</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={async () => { setIsRefreshing(true); await fetchCharges(); setIsRefreshing(false) }}
            className="h-9 w-9"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh charges</span>
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-accent hover:bg-accent/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Charge
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div>
            <h4 className="font-medium">Error loading charges</h4>
            <p className="text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchCharges}
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
          <CardTitle>Search Charges</CardTitle>
          <CardDescription>Search by patient, charge ID, status, or description</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search charges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Charges Table */}
      <Card>
        <CardHeader>
          <CardTitle>Charge Items</CardTitle>
          <CardDescription>
            {isLoading ? "Loading charges..." : `${filteredCharges.length} charge${filteredCharges.length !== 1 ? "s" : ""} found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading charge records...</p>
              </div>
            </div>
          ) : filteredCharges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <DollarSign className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No charges found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Try adjusting your search criteria" : "Get started by adding your first charge"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Charge
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Charge ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCharges.map((charge) => (
                  <TableRow key={charge.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <div>
                          <div className="font-medium">{charge.id}</div>
                          {charge.context && (
                            <div className="text-sm text-muted-foreground">
                              Encounter: {charge.context.reference}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{charge.subject.display}</div>
                          <div className="text-sm text-muted-foreground">{charge.subject.reference}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        {charge.financialTransactionDetail.length > 0 ? (
                          <div>
                            <div className="font-medium truncate">
                              {charge.financialTransactionDetail[0].description}
                            </div>
                            {charge.financialTransactionDetail[0].code.coding.length > 0 && (
                              <div className="text-sm text-muted-foreground">
                                {charge.financialTransactionDetail[0].code.coding[0].code}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No description</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(charge.totalCost.value, charge.totalCost.currency)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(charge.status)}>
                        {charge.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDateTime(charge.occurrenceDateTime)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewCharge(charge)}
                          className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View charge</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEdit(charge)}
                          className="h-8 w-8 hover:bg-orange-50 hover:text-orange-600"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit charge</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(charge.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete charge</span>
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

      {/* Add Charge Dialog */}
      <BillingDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onChargeCreated={fetchCharges} />

      {/* Edit Charge Dialog */}
      <BillingDialog 
        charge={selectedCharge} 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        onChargeCreated={fetchCharges} 
      />
    </div>
  )
}
