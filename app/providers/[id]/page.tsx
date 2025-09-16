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
  UserCheck, 
  GraduationCap, 
  Award,
  Loader2,
  RefreshCw,
  AlertCircle,
  
  Clock,
  Activity,
  Users,
  Stethoscope
} from "lucide-react";
import { ProviderDialog } from "@/components/provider-dialog";

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

interface ProviderDetail {
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
  qualification?: Array<{
    identifier?: Array<{
      system: string;
      value: string;
    }>;
    code: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
    period?: {
      start: string;
      end?: string;
    };
    issuer?: {
      display: string;
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
}

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const providerId = params.id as string;

  const [provider, setProvider] = useState<Provider | null>(null);
  const [providerDetail, setProviderDetail] = useState<ProviderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch provider details from FHIR API
  const fetchProviderDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/provider/${providerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch provider: ${response.status}`);
      }

      const data = await response.json();
      setProviderDetail(data);

      // Transform FHIR data to our Provider interface
      const transformedProvider: Provider = {
        id: data.id || 'N/A',
        name: data.name?.[0] ? `${data.name[0].given?.[0] || ''} ${data.name[0].family || ''}`.trim() : 'N/A',
        specialty: data.qualification?.[0]?.code?.coding?.[0]?.display || 'N/A',
        email: data.telecom?.find((t: any) => t.system === 'email')?.value || 'N/A',
        phone: data.telecom?.find((t: any) => t.system === 'phone')?.value || 'N/A',
        license: data.qualification?.[0]?.identifier?.[0]?.value || 'N/A',
        status: data.active ? 'Active' : 'Inactive',
        joinDate: 'N/A', 
        patientsCount: 0, 
        appointmentsToday: 0, 
        gender: data.gender || 'N/A',
        birthDate: data.birthDate || 'N/A',
        address: data.address?.[0] ? 
          `${data.address[0].line?.[0] || ''}, ${data.address[0].city || ''}, ${data.address[0].state || ''} ${data.address[0].postalCode || ''}`.trim() : 'N/A',
        qualification: data.qualification?.[0]?.code?.coding?.[0]?.display || 'N/A',
        communication: data.communication?.[0]?.language?.coding?.[0]?.display || 'N/A',
      };

      setProvider(transformedProvider);
    } catch (err) {
      console.error('Error fetching provider details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch provider details');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (providerId) {
      fetchProviderDetails();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchProviderDetails();
    setIsRefreshing(false);
  };

  const handleBack = () => {
    router.push('/providers');
  };

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this provider? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/provider/${providerId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          router.push('/providers');
        } else {
          throw new Error('Failed to delete provider');
        }
      } catch (err) {
        console.error('Error deleting provider:', err);
        setError('Failed to delete provider');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "On Leave":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "Inactive":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading provider details...</p>
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
            Back to Providers
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div>
            <h4 className="font-medium">Error loading provider</h4>
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

  if (!provider) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Providers
          </Button>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <div>
            <h4 className="font-medium">Provider not found</h4>
            <p className="text-sm">The provider with ID {providerId} could not be found.</p>
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
            Back to Providers
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{provider.name}</h1>
            <p className="text-muted-foreground">Provider ID: {provider.id}</p>
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
            <span className="sr-only">Refresh provider</span>
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Provider
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <Badge className={getStatusColor(provider.status)}>
          {provider.status}
        </Badge>
        <span className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </span>
      </div>

      {/* Provider Information Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="text-sm">{provider.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Provider ID</label>
                    <p className="text-sm font-mono">{provider.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                    <p className="text-sm">{provider.birthDate !== 'N/A' ? new Date(provider.birthDate as string).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Gender</label>
                    <p className="text-sm">{provider.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Primary Language</label>
                    <p className="text-sm">{provider.communication}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Join Date</label>
                    <p className="text-sm">{provider.joinDate}</p>
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
                    <span className="text-sm">{provider.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{provider.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm">{provider.address}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Specialty</label>
                    <Badge variant="secondary" className="mt-1">
                      {provider.specialty}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">License Number</label>
                    <p className="text-sm font-mono">{provider.license}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Practice Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total Patients</label>
                    <p className="text-2xl font-bold text-primary">{provider.patientsCount}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Today&apos;s Appointments</label>
                    <p className="text-2xl font-bold text-accent">{provider.appointmentsToday}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Qualifications Tab */}
        <TabsContent value="qualifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Professional Qualifications
              </CardTitle>
              <CardDescription>Education, certifications, and professional credentials</CardDescription>
            </CardHeader>
            <CardContent>
              {providerDetail?.qualification && providerDetail.qualification.length > 0 ? (
                <div className="space-y-4">
                  {providerDetail.qualification.map((qual, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold">
                          {qual.code?.coding?.[0]?.display || 'Qualification'}
                        </h4>
                      </div>
                      {qual.identifier && qual.identifier.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">License: </span>
                          {qual.identifier[0].value}
                        </div>
                      )}
                      {qual.period && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Period: </span>
                          {qual.period.start ? new Date(qual.period.start).toLocaleDateString() : 'N/A'}
                          {qual.period.end && ` - ${new Date(qual.period.end).toLocaleDateString()}`}
                        </div>
                      )}
                      {qual.issuer && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Issuer: </span>
                          {qual.issuer.display}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No qualifications found</h3>
                    <p className="text-muted-foreground">Qualification data will be displayed here when available.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule & Availability
              </CardTitle>
              <CardDescription>Provider&apos;s schedule and availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Schedule not available</h3>
                  <p className="text-muted-foreground">Schedule data will be displayed here when available.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Assigned Patients
              </CardTitle>
              <CardDescription>Patients under this provider&apos;s care</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Patient data not available</h3>
                  <p className="text-muted-foreground">Patient assignments will be displayed here when available.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Provider Dialog */}
      <ProviderDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen}
        provider={provider}
        
      />
    </div>
  );
}
