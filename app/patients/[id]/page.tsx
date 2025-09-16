/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  User, 
  Heart, 
  Pill, 
  AlertTriangle,
  Loader2,
  RefreshCw,
  AlertCircle,
  FileText,
  Clock,
  Activity
} from "lucide-react";
import { FhirPatient, PatientDialog } from "@/components/patient-dialog";

interface Patient {
  id: string;
  name: string;
  phone: string;
  dob: string;
  lastAppointment: string;
  status: string;
  email: string;
  address: string;
  emergencyContact: string;
  allergies: string[];
  conditions: string[];
  medications: string[];
  gender?: string;
  maritalStatus?: string;
  language?: string;
  race?: string;
  ethnicity?: string;
}

interface PatientDetail {
  resourceType: string;
  id: string;
  active: boolean;
  name: Array<{
    use: string;
    family: string;
    given: string[];
  }>;
  telecom: Array<{
    system: string;
    value: string;
    use?: string;
  }>;
  gender: string;
  birthDate: string;
  address: Array<{
    use: string;
    line: string[];
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }>;
  maritalStatus?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  contact?: Array<{
    relationship: Array<{
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    }>;
    telecom: Array<{
      system: string;
      value: string;
    }>;
    name: {
      family: string;
      given: string[];
    };
  }>;
  communication?: Array<{
    language: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
  }>;
  extension?: Array<{
    url: string;
    valueCodeableConcept: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
  }>;
}

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [patientDetail, setPatientDetail] = useState<PatientDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch patient details from FHIR API
  const fetchPatientDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch patient: ${response.status}`);
      }

      const data = await response.json();
      setPatientDetail(data);

      // Transform FHIR data to our Patient interface
      const transformedPatient: Patient = {
        id: data.id || 'N/A',
        name: data.name?.[0] ? `${data.name[0].given?.[0] || ''} ${data.name[0].family || ''}`.trim() : 'N/A',
        phone: data.telecom?.find((t: any) => t.system === 'phone')?.value || 'N/A',
        dob: data.birthDate || 'N/A',
        lastAppointment: 'N/A', // This would need to be fetched separately
        status: data.active ? 'Active' : 'Inactive',
        email: data.telecom?.find((t: any) => t.system === 'email')?.value || 'N/A',
        address: data.address?.[0] ? 
          `${data.address[0].line?.[0] || ''}, ${data.address[0].city || ''}, ${data.address[0].state || ''} ${data.address[0].postalCode || ''}`.trim() : 'N/A',
        emergencyContact: data.contact?.[0] ? 
          `${data.contact[0].name?.given?.[0] || ''} ${data.contact[0].name?.family || ''} - ${data.contact[0].telecom?.[0]?.value || ''}`.trim() : 'N/A',
        allergies: [], // This would need to be fetched separately
        conditions: [], // This would need to be fetched separately
        medications: [], // This would need to be fetched separately
        gender: data.gender || 'N/A',
        maritalStatus: data.maritalStatus?.coding?.[0]?.display || 'N/A',
        language: data.communication?.[0]?.language?.coding?.[0]?.display || 'N/A',
        race: data.extension?.find((ext: any) => ext.url.includes('race'))?.valueCodeableConcept?.coding?.[0]?.display || 'N/A',
        ethnicity: data.extension?.find((ext: any) => ext.url.includes('ethnicity'))?.valueCodeableConcept?.coding?.[0]?.display || 'N/A',
      };

      setPatient(transformedPatient);
    } catch (err) {
      console.error('Error fetching patient details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch patient details');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (patientId) {
      fetchPatientDetails();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPatientDetails();
    setIsRefreshing(false);
  };

  const handleBack = () => {
    router.push('/patients');
  };

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/patients/${patientId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          router.push('/patients');
        } else {
          throw new Error('Failed to delete patient');
        }
      } catch (err) {
        console.error('Error deleting patient:', err);
        setError('Failed to delete patient');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading patient details...</p>
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
            Back to Patients
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div>
            <h4 className="font-medium">Error loading patient</h4>
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

  if (!patient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patients
          </Button>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <div>
            <h4 className="font-medium">Patient not found</h4>
            <p className="text-sm">The patient with ID {patientId} could not be found.</p>
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
            Back to Patients
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{patient.name}</h1>
            <p className="text-muted-foreground">Patient ID: {patient.id}</p>
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
            <span className="sr-only">Refresh patient</span>
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Patient
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <Badge 
          variant={patient.status === "Active" ? "default" : "secondary"}
          className={patient.status === "Active" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
        >
          {patient.status}
        </Badge>
        <span className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </span>
      </div>

      {/* Patient Information Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="medical">Medical History</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-sm">{patient.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Patient ID</label>
                    <p className="text-sm font-mono">{patient.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                    <p className="text-sm">{patient.dob !== 'N/A' ? new Date(patient.dob).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Gender</label>
                    <p className="text-sm">{patient.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Marital Status</label>
                    <p className="text-sm">{patient.maritalStatus}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Language</label>
                    <p className="text-sm">{patient.language}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{patient.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm">{patient.address}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{patient.emergencyContact}</p>
              </CardContent>
            </Card>

            {/* Demographics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Demographics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Race</label>
                    <p className="text-sm">{patient.race}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ethnicity</label>
                    <p className="text-sm">{patient.ethnicity}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Medical History Tab */}
        <TabsContent value="medical" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Allergies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Allergies
                </CardTitle>
                <CardDescription>Known allergies and adverse reactions</CardDescription>
              </CardHeader>
              <CardContent>
                {patient.allergies.length > 0 ? (
                  <div className="space-y-2">
                    {patient.allergies.map((allergy, index) => (
                      <Badge key={index} variant="destructive" className="mr-2">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No known allergies</p>
                )}
              </CardContent>
            </Card>

            {/* Conditions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-blue-500" />
                  Medical Conditions
                </CardTitle>
                <CardDescription>Current and past medical conditions</CardDescription>
              </CardHeader>
              <CardContent>
                {patient.conditions.length > 0 ? (
                  <div className="space-y-2">
                    {patient.conditions.map((condition, index) => (
                      <Badge key={index} variant="secondary" className="mr-2">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No medical conditions recorded</p>
                )}
              </CardContent>
            </Card>

            {/* Medications */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-green-500" />
                  Current Medications
                </CardTitle>
                <CardDescription>Active medications and prescriptions</CardDescription>
              </CardHeader>
              <CardContent>
                {patient.medications.length > 0 ? (
                  <div className="space-y-2">
                    {patient.medications.map((medication, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                        <Pill className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{medication}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No current medications</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appointment History
              </CardTitle>
              <CardDescription>Recent and upcoming appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
                  <p className="text-muted-foreground">Appointment data will be displayed here when available.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Patient Documents
              </CardTitle>
              <CardDescription>Medical records, reports, and documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No documents found</h3>
                  <p className="text-muted-foreground">Patient documents will be displayed here when available.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Patient Dialog */}
      <PatientDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen}
        patient={patientDetail as FhirPatient}
        
      />
    </div>
  );
}
