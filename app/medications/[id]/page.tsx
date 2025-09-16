"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Pill, 
  User, 
  Calendar, 
  UserCheck,
  Loader2,
  RefreshCw,
  AlertCircle,
  FileText,
  Clock,
  Activity,
  Stethoscope,
  AlertTriangle,
  Info
} from "lucide-react";
import { MedicationDialog } from "@/components/medication-dialog";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  patient: string;
  patientId: string;
  prescribedBy: string;
  startDate: string;
  endDate: string;
  status: string;
  notes: string;
  medicationCode?: string;
  route?: string;
  effectivePeriod?: {
    start: string;
    end?: string;
  };
  dosageInstruction?: string;
  reasonCode?: string;
}

interface MedicationDetail {
  resourceType: string;
  id: string;
  status: string;
  medicationCodeableConcept: {
    text?: string;
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  subject: {
    reference: string;
    display: string;
  };
  effectivePeriod?: {
    start: string;
    end?: string;
  };
  dosage?: Array<{
    text?: string;
    route?: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
    doseAndRate?: Array<{
      doseQuantity?: {
        value: number;
        unit: string;
      };
    }>;
  }>;
  informationSource?: {
    reference: string;
    display: string;
  };
  note?: Array<{
    text: string;
  }>;
  reasonCode?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
}

export default function MedicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const medicationId = params.id as string;

  const [medication, setMedication] = useState<Medication | null>(null);
  const [medicationDetail, setMedicationDetail] = useState<MedicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch medication details from FHIR API
  const fetchMedicationDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/medications/${medicationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch medication: ${response.status}`);
      }

      const data = await response.json();
      setMedicationDetail(data);

      // Transform FHIR data to our Medication interface
      const transformedMedication: Medication = {
        id: data.id || 'N/A',
        name: data.medicationCodeableConcept?.text || 
              data.medicationCodeableConcept?.coding?.[0]?.display || 'N/A',
        dosage: data.dosage?.[0]?.doseAndRate?.[0]?.doseQuantity?.value + 
                data.dosage?.[0]?.doseAndRate?.[0]?.doseQuantity?.unit || 'N/A',
        frequency: data.dosage?.[0]?.text || 'N/A',
        patient: data.subject?.display || 'N/A',
        patientId: data.subject?.reference || 'N/A',
        prescribedBy: data.informationSource?.display || 'N/A',
        startDate: data.effectivePeriod?.start || 'N/A',
        endDate: data.effectivePeriod?.end || '',
        status: data.status || 'N/A',
        notes: data.note?.[0]?.text || '',
        medicationCode: data.medicationCodeableConcept?.coding?.[0]?.code || 'N/A',
        route: data.dosage?.[0]?.route?.coding?.[0]?.display || 'N/A',
        effectivePeriod: {
          start: data.effectivePeriod?.start || 'N/A',
          end: data.effectivePeriod?.end || ''
        },
        dosageInstruction: data.dosage?.[0]?.text || 'N/A',
        reasonCode: data.reasonCode?.[0]?.coding?.[0]?.display || 'N/A',
      };

      setMedication(transformedMedication);
    } catch (err) {
      console.error('Error fetching medication details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch medication details');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (medicationId) {
      fetchMedicationDetails();
    }
  }, [medicationId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchMedicationDetails();
    setIsRefreshing(false);
  };

  const handleBack = () => {
    router.push('/medications');
  };

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this medication? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/medications/${medicationId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          router.push('/medications');
        } else {
          throw new Error('Failed to delete medication');
        }
      } catch (err) {
        console.error('Error deleting medication:', err);
        setError('Failed to delete medication');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "completed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "discontinued":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "entered-in-error":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading medication details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Medications
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div>
            <h4 className="font-medium">Error loading medication</h4>
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
    );
  }

  if (!medication) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Medications
          </Button>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <div>
            <h4 className="font-medium">Medication not found</h4>
            <p className="text-sm">The medication with ID {medicationId} could not be found.</p>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Medications
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{medication.name}</h1>
            <p className="text-muted-foreground">Medication ID: {medication.id}</p>
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
            <span className="sr-only">Refresh medication</span>
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Medication
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <Badge className={getStatusColor(medication.status)}>
          {medication.status}
        </Badge>
        <span className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </span>
      </div>

      {/* Medication Information Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dosage">Dosage & Instructions</TabsTrigger>
          <TabsTrigger value="patient">Patient Information</TabsTrigger>
          <TabsTrigger value="history">History & Notes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Medication Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Medication Name</label>
                    <p className="text-sm font-medium">{medication.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Medication ID</label>
                    <p className="text-sm font-mono">{medication.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Medication Code</label>
                    <p className="text-sm font-mono">{medication.medicationCode}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Route</label>
                    <p className="text-sm">{medication.route}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge className={getStatusColor(medication.status)}>
                      {medication.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Reason Code</label>
                    <p className="text-sm">{medication.reasonCode}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prescription Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Prescription Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Prescribed By</label>
                      <p className="text-sm">{medication.prescribedBy}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                      <p className="text-sm">{medication.startDate !== 'N/A' ? new Date(medication.startDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                  {medication.endDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">End Date</label>
                        <p className="text-sm">{new Date(medication.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
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
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Patient Name</label>
                    <p className="text-sm font-medium">{medication.patient}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Patient ID</label>
                    <p className="text-sm font-mono">{medication.patientId}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.push(`/patients/${medication.patientId.split('/').pop()}`)}
                    className="w-fit"
                  >
                    <User className="mr-2 h-4 w-4" />
                    View Patient
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  View Prescription
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Check Interactions
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="mr-2 h-4 w-4" />
                  Refill Request
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Dosage & Instructions Tab */}
        <TabsContent value="dosage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Dosage & Administration Instructions
              </CardTitle>
              <CardDescription>Detailed dosage information and administration instructions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Dosage</label>
                    <p className="text-lg font-semibold">{medication.dosage}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Frequency</label>
                    <p className="text-lg font-semibold">{medication.frequency}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Route of Administration</label>
                    <p className="text-lg font-semibold">{medication.route}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Dosage Instructions</label>
                    <div className="p-3 bg-muted/50 rounded-md">
                      <p className="text-sm">{medication.dosageInstruction}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Treatment Duration</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {medication.startDate !== 'N/A' ? new Date(medication.startDate).toLocaleDateString() : 'N/A'}
                        {medication.endDate && ` - ${new Date(medication.endDate).toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patient Information Tab */}
        <TabsContent value="patient" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Details
              </CardTitle>
              <CardDescription>Information about the patient taking this medication</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Patient details not available</h3>
                  <p className="text-muted-foreground mb-4">Detailed patient information will be displayed here when available.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push(`/patients/${medication.patientId.split('/').pop()}`)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    View Patient Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History & Notes Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Medication History & Notes
              </CardTitle>
              <CardDescription>Historical information and clinical notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {medication.notes ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Clinical Notes</label>
                    <div className="p-4 bg-muted/50 rounded-md">
                      <p className="text-sm whitespace-pre-wrap">{medication.notes}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No notes available</h3>
                    <p className="text-muted-foreground">Clinical notes and history will be displayed here when available.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Medication Dialog */}
      <MedicationDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen}
        medication={medication}
        mode="edit"
      />
    </div>
  );
}
