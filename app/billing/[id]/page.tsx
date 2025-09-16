"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert } from "@/components/ui/alert"
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  DollarSign, 
   
  User, 
  FileText,
  Loader2,
  RefreshCw,
  AlertCircle,
  CreditCard,
  
} from "lucide-react"
import { BillingDialog } from "@/components/billing-dialog"

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

export default function BillingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const chargeId = params.id as string

  const [charge, setCharge] = useState<ChargeItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const fetchChargeDetails = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/billing/${chargeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch charge: ${response.status}`)
      }

      const data = await response.json()
      setCharge(data)
    } catch (err) {
      console.error('Error fetching charge details:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch charge details')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (chargeId) {
      fetchChargeDetails()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chargeId])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchChargeDetails()
    setIsRefreshing(false)
  }

  const handleBack = () => {
    router.push('/billing')
  }

  const handleEdit = () => {
    setIsEditDialogOpen(true)
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this charge? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/billing/${chargeId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          router.push('/billing')
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading charge details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Billing
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div>
            <h4 className="font-medium">Error loading charge</h4>
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
      </div>
    )
  }

  if (!charge) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Billing
          </Button>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <div>
            <h4 className="font-medium">Charge not found</h4>
            <p className="text-sm">The charge with ID {chargeId} could not be found.</p>
          </div>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Billing
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Charge Details</h1>
            <p className="text-muted-foreground">Charge ID: {charge.id}</p>
          </div>
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
            <span className="sr-only">Refresh charge</span>
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Charge
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <Badge className={getStatusColor(charge.status)}>
          {charge.status}
        </Badge>
        <span className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Charge Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Charge ID</label>
                <p className="text-sm font-mono">{charge.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge className={getStatusColor(charge.status)}>
                    {charge.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(charge.totalCost.value, charge.totalCost.currency)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date</label>
                <p className="text-sm">{formatDateTime(charge.occurrenceDateTime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Patient Name</label>
              <p className="text-sm font-medium">{charge.subject.display}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Patient ID</label>
              <p className="text-sm font-mono">{charge.subject.reference}</p>
            </div>
            {charge.context && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Encounter</label>
                <p className="text-sm font-mono">{charge.context.reference}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Financial Transaction Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {charge.financialTransactionDetail.length > 0 ? (
              <div className="space-y-4">
                {charge.financialTransactionDetail.map((detail, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{detail.description}</h4>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {formatCurrency(detail.unitCost.value, detail.unitCost.currency)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {detail.quantity.valueDecimal}
                        </p>
                      </div>
                    </div>
                    {detail.code.coding.length > 0 && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="font-medium text-muted-foreground">CPT Code</label>
                          <p className="font-mono">{detail.code.coding[0].code}</p>
                        </div>
                        <div>
                          <label className="font-medium text-muted-foreground">Code Description</label>
                          <p>{detail.code.coding[0].display}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No financial transaction details available</p>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        {charge.note && charge.note.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {charge.note.map((note, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-md">
                    <p className="text-sm">{note.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Charge Dialog */}
      <BillingDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen}
        charge={charge}
        onChargeCreated={fetchChargeDetails}
      />
    </div>
  )
}
