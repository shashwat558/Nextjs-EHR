"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert } from "@/components/ui/alert"
import { Search, Eye, DollarSign, Calendar, User, Loader2, RefreshCw, AlertCircle, ArrowLeft, Download } from "lucide-react"
import { useRouter } from "next/navigation"

interface InboundChargeItem {
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

export default function InboundBillingPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [charges, setCharges] = useState<InboundChargeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchInboundCharges = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch('/api/billing/inbound?_count=50', {
        headers: { 'accept': 'application/json' }
      })
      if (!res.ok) throw new Error(`Failed to fetch inbound charges: ${res.status}`)
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
        const transformed: InboundChargeItem[] = chargesData.map((charge: Record<string, unknown>) => ({
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
      console.error('Error fetching inbound charges:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch inbound charges')
      setCharges([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInboundCharges()
  }, [])

  const filteredCharges = charges.filter(
    (charge) =>
      charge.subject.display.toLowerCase().includes(searchTerm.toLowerCase()) ||
      charge.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      charge.financialTransactionDetail.some(detail => 
        detail.description.toLowerCase().includes(searchTerm.toLowerCase())
      ),
  )

  const handleViewCharge = (charge: InboundChargeItem) => {
    router.push(`/billing/inbound/${charge.id}`)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "inbound":
        return "bg-blue-100 text-blue-800"
      case "processed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "error":
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

  const handleExport = () => {
    // Simple CSV export functionality
    const csvContent = [
      ['Charge ID', 'Patient', 'Description', 'Amount', 'Status', 'Date'].join(','),
      ...filteredCharges.map(charge => [
        charge.id,
        charge.subject.display,
        charge.financialTransactionDetail[0]?.description || '',
        charge.totalCost.value,
        charge.status,
        charge.occurrenceDateTime
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inbound-charges-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/billing')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Billing
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inbound Charges</h1>
            <p className="text-muted-foreground">Charges received from external systems</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleExport}
            disabled={filteredCharges.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={async () => { setIsRefreshing(true); await fetchInboundCharges(); setIsRefreshing(false) }}
            className="h-9 w-9"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh inbound charges</span>
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div>
            <h4 className="font-medium">Error loading inbound charges</h4>
            <p className="text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchInboundCharges}
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
          <CardTitle>Search Inbound Charges</CardTitle>
          <CardDescription>Search by patient, charge ID, or description</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search inbound charges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Inbound Charges Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inbound Charge Items</CardTitle>
          <CardDescription>
            {isLoading ? "Loading inbound charges..." : `${filteredCharges.length} inbound charge${filteredCharges.length !== 1 ? "s" : ""} found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading inbound charge records...</p>
              </div>
            </div>
          ) : filteredCharges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <DollarSign className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No inbound charges found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search criteria" : "No inbound charges have been received yet"}
              </p>
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
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCharges.map((charge) => (
                  <TableRow key={charge.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-blue-500" />
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
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {charge.note?.[0]?.text || 'External System'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewCharge(charge)}
                        className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View inbound charge</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
