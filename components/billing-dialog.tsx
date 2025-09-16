"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"

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

interface BillingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  charge?: ChargeItem | null
  onChargeCreated?: () => void
}

const statusOptions = [
  { value: "billable", label: "Billable" },
  { value: "inbound", label: "Inbound" },
  { value: "billed", label: "Billed" },
  { value: "cancelled", label: "Cancelled" }
]

const currencyOptions = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" }
]

const commonCodes = [
  { code: "99213", display: "Office Visit Level 3", description: "Office Visit - Level 3" },
  { code: "99214", display: "Office Visit Level 4", description: "Office Visit - Level 4" },
  { code: "99243", display: "Office Consultation Level 3", description: "Office Consultation Level 3" },
  { code: "85025", display: "Complete Blood Count", description: "Laboratory Test - CBC" },
  { code: "93000", display: "Electrocardiogram", description: "Electrocardiogram" },
  { code: "99281", display: "Emergency Department Visit", description: "Emergency Department Visit" }
]

export function BillingDialog({ open, onOpenChange, charge, onChargeCreated }: BillingDialogProps) {
  const [formData, setFormData] = useState({
    patientId: "",
    encounterId: "",
    description: "",
    code: "",
    codeDisplay: "",
    cost: "",
    currency: "USD",
    status: "billable",
    quantity: "1",
    notes: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (charge) {
      // Populate form with existing charge data
      setFormData({
        patientId: charge.subject.reference.replace('Patient/', ''),
        encounterId: charge.context?.reference.replace('Encounter/', '') || "",
        description: charge.financialTransactionDetail[0]?.description || "",
        code: charge.financialTransactionDetail[0]?.code.coding[0]?.code || "",
        codeDisplay: charge.financialTransactionDetail[0]?.code.coding[0]?.display || "",
        cost: charge.totalCost.value.toString(),
        currency: charge.totalCost.currency,
        status: charge.status,
        quantity: charge.financialTransactionDetail[0]?.quantity.valueDecimal.toString() || "1",
        notes: charge.note?.[0]?.text || ""
      })
    } else {
      // Reset form for new charge
      setFormData({
        patientId: "",
        encounterId: "",
        description: "",
        code: "",
        codeDisplay: "",
        cost: "",
        currency: "USD",
        status: "billable",
        quantity: "1",
        notes: ""
      })
    }
  }, [charge, open])

  const handleCodeChange = (selectedCode: string) => {
    const codeData = commonCodes.find(c => c.code === selectedCode)
    if (codeData) {
      setFormData(prev => ({
        ...prev,
        code: codeData.code,
        codeDisplay: codeData.display,
        description: codeData.description
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const chargeItem = {
        resourceType: "ChargeItem",
        status: formData.status,
        subject: { reference: `Patient/${formData.patientId}` },
        context: formData.encounterId ? { reference: `Encounter/${formData.encounterId}` } : undefined,
        occurrenceDateTime: new Date().toISOString(),
        totalCost: { 
          value: parseFloat(formData.cost), 
          currency: formData.currency 
        },
        financialTransactionDetail: [{
          description: formData.description,
          unitCost: { 
            value: parseFloat(formData.cost), 
            currency: formData.currency 
          },
          quantity: { valueDecimal: parseFloat(formData.quantity) },
          code: {
            coding: [{
              system: "http://www.ama-assn.org/go/cpt",
              code: formData.code,
              display: formData.codeDisplay
            }]
          }
        }],
        ...(formData.notes && {
          note: [{ text: formData.notes }]
        })
      }

      const url = charge ? `/api/billing/${charge.id}` : '/api/billing'
      const method = charge ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chargeItem)
      })

      if (!response.ok) {
        throw new Error(`Failed to ${charge ? 'update' : 'create'} charge`)
      }

      onChargeCreated?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving charge:', error)
      alert(`Failed to ${charge ? 'update' : 'create'} charge. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {charge ? 'Edit Charge Item' : 'Add New Charge Item'}
          </DialogTitle>
          <DialogDescription>
            {charge ? 'Update the charge item details below.' : 'Create a new charge item for billing.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient ID *</Label>
              <Input
                id="patientId"
                value={formData.patientId}
                onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                placeholder="e.g., 67890"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="encounterId">Encounter ID</Label>
              <Input
                id="encounterId"
                value={formData.encounterId}
                onChange={(e) => setFormData(prev => ({ ...prev, encounterId: e.target.value }))}
                placeholder="e.g., enc-001"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">CPT Code *</Label>
            <Select value={formData.code} onValueChange={handleCodeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a CPT code" />
              </SelectTrigger>
              <SelectContent>
                {commonCodes.map((code) => (
                  <SelectItem key={code.code} value={code.code}>
                    {code.code} - {code.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter charge description"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Cost *</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes or comments"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (charge ? 'Update Charge' : 'Create Charge')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
