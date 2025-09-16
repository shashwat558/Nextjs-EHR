import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, {params}: {params: Promise<{id: string}>}) {
    const {id} = await params;

    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token");

    if (!access_token) {
        return NextResponse.json({ error: "No access token found" }, { status: 401 });
    };

    try {
        const res = await fetch(`${process.env.BASE_URL}/apiportal/ema/fhir/v2/Appointment/${id}`, {
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
        console.error("Error getting appointment:", error);
        return NextResponse.json({
            message: "Error getting appointment", 
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}


export async function PUT(req: NextRequest, {params}: {params: Promise<{id: string}>}) {
    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token");
    const {id} = await params;
    

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

        if (!id) {
            return NextResponse.json({ error: "Appointment ID is required for update" }, { status: 400 });
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
            id,
            ...(status && { status }),
            ...(participant && { 
                participant: participant.map((p: Record<string, unknown>) => ({
                    actor: { reference: p.reference },
                    status: p.status || "accepted"
                }))
            }),
            ...(appointmentType && { appointmentType }),
            ...(start && { start }),
            ...(end && { end }),
            ...(minutesDuration && { minutesDuration }),
            ...(description && { description }),
            ...(reportableReason && { reportableReason }),
            ...(supportingInformation && { supportingInformation }),
            ...(comment && { comment }),
            ...(cancelationReason && { cancelationReason })
        };

        const res = await fetch(`${process.env.BASE_URL}/apiportal/ema/fhir/v2/Appointment/${id}`, {
            method: "PUT",
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
            message: "Appointment updated successfully",
            mmpmStatus: mapStatusToMMPM(data.status || status || "pending")
        });
    } catch (error) {
        console.error("Error updating appointment:", error);
        return NextResponse.json(
            { message: "Error updating appointment", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
