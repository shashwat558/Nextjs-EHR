import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token");

    if (!access_token) {
        return NextResponse.json({ error: "No access token found" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    

    const count = searchParams.get("_count");
    const page = searchParams.get("page");
    const patient = searchParams.get("patient");
    const lastUpdated = searchParams.get("_lastUpdated");
    const date = searchParams.get("date");
    const status = searchParams.get("status");
    const practitioner = searchParams.get("practitioner");
    const location = searchParams.get("location");
    const serviceType = searchParams.get("service-type");
    const appointmentType = searchParams.get("appointment-type");

    
    const queryParams: Record<string, string> = {};

    
    if (count) queryParams._count = count;
    if (page) queryParams.page = page;
    if (patient) queryParams.patient = patient;
    if (lastUpdated) queryParams._lastUpdated = lastUpdated;
    if (date) queryParams.date = date;
    if (status) queryParams.status = status;
    if (practitioner) queryParams.practitioner = practitioner;
    if (location) queryParams.location = location;
    if (serviceType) queryParams["service-type"] = serviceType;
    if (appointmentType) queryParams["appointment-type"] = appointmentType;

    
    const queryString = new URLSearchParams(queryParams).toString();
    const apiUrl = `${process.env.BASE_URL}/apiportal/ema/fhir/v2/Appointment${queryString ? `?${queryString}` : ''}`;

    try {
        const res = await fetch(apiUrl, {
            headers: {
                accept: "application/fhir+json",
                authorization: `Bearer ${access_token.value}`,
                'x-api-key': `${process.env.API_KEY}`
            },
        });

        if (!res.ok) {
            throw new Error(`API request failed with status: ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return NextResponse.json(
            { message: "Error fetching appointments", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token");

    if (!access_token) {
        return NextResponse.json({ error: "No access token found" }, { status: 401 });
    }

    try {
        const {
            participant,
            appointmentType,
            start,
            end,
            minutesDuration,
            status,
            description,
            reportableReason,
            supportingInformation,
            comment,
            cancelationReason
        } = await req.json();

        
        if (!participant || !Array.isArray(participant) || participant.length === 0) {
            return NextResponse.json({
                error: "Missing required field",
                message: "participant is required and must be an array with at least one participant"
            }, { status: 400 });
        }

        if (!start) {
            return NextResponse.json({
                error: "Missing required field",
                message: "start (datetime) is required"
            }, { status: 400 });
        }

        if (!end && !minutesDuration) {
            return NextResponse.json({
                error: "Missing required field",
                message: "Either end (datetime) or minutesDuration (integer) is required"
            }, { status: 400 });
        }

        
        const validParticipantTypes = ['Patient', 'Location', 'Practitioner'];
        for (const p of participant) {
            if (!p.reference) {
                return NextResponse.json({
                    error: "Invalid participant",
                    message: "Each participant must have a reference field"
                }, { status: 400 });
            }
            
            const referenceType = p.reference.split('/')[0];
            if (!validParticipantTypes.includes(referenceType)) {
                return NextResponse.json({
                    error: "Invalid participant type",
                    message: `Participant reference must be one of: ${validParticipantTypes.join(', ')}`
                }, { status: 400 });
            }
        }

        
        const mapStatusToMMPM = (fhirStatus: string) => {
            const statusMap: Record<string, string> = {
                'pending': 'pending',
                'booked': 'confirmed',
                'arrived': 'arrived',
                'fulfilled': 'checked-out',
                'cancelled': 'cancelled',
                'noshow': 'no show',
                'entered-in-error': 'NOT SUPPORTED in MMPM',
                'checkedin': 'checked in',
                'waitlist': 'NOT SUPPORTED in MMPM'
            };
            return statusMap[fhirStatus] || fhirStatus;
        };

      
        const appointmentResource = {
            resourceType: "Appointment",
            status: status || "pending",
            participant: participant.map(p => ({
                actor: { reference: p.reference },
                status: p.status || "accepted"
            })),
            ...(appointmentType && { appointmentType }),
            start,
            ...(end && { end }),
            ...(minutesDuration && { minutesDuration }),
            ...(description && { description }),
            ...(reportableReason && { reportableReason }),
            ...(supportingInformation && { supportingInformation }),
            ...(comment && { comment }),
            ...(cancelationReason && { cancelationReason })
        };

        const res = await fetch(`${process.env.BASE_URL}/apiportal/ema/fhir/v2/Appointment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/fhir+json",
                "accept": "application/fhir+json",
                "authorization": `Bearer ${access_token.value}`,
                "x-api-key": `${process.env.API_KEY}`
            },
            body: JSON.stringify(appointmentResource)
        });

        if (!res.ok) {
            throw new Error(`API request failed with status: ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json({
            ...data,
            message: "Appointment created successfully",
            mmpmStatus: mapStatusToMMPM(data.status || status || "pending")
        }, { status: 201 });
    } catch (error) {
        console.error("Error creating appointment:", error);
        return NextResponse.json(
            { message: "Error creating appointment", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

