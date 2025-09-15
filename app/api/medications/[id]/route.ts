import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, {params}: {params: {id: string}}) {
    const {id} = params;

    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token")?.value;
    
    try {
        const res = await fetch(`${process.env.BASE_URL}/apiportal/ema/fhir/v2/Medication/${id}`, {
            headers: {
                accept: "application/fhir+json",
                authorization: `Bearer ${access_token}`,
                'x-api-key': `${process.env.API_KEY}`
            },
        });

        if (!res.ok) {
            throw new Error(`API request failed with status: ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({message: "Error getting medication"}, {status: 500});
    }

}


export async function PUT(req: NextRequest, {params}: {params: {id: string}}) {
    const {id} = params;

    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token");

    if (!access_token) {
        return NextResponse.json({ error: "No access token found" }, { status: 401 });
    }

    try {
        const requestBody = await req.json();
        
        
        const allowedFields = ['status', 'effectivePeriod'];
        const updateData: Record<string, unknown> = {};

        
        const immutableFields = [
            'informationSource',
            'subject', 
            'medicationCodeableConcept',
            'dosage',
            'reasonCode',
            'note'
        ];

        const attemptedImmutableUpdates = immutableFields.filter(field => 
            requestBody.hasOwnProperty(field)
        );

        if (attemptedImmutableUpdates.length > 0) {
            return NextResponse.json({
                error: "Immutable fields cannot be updated",
                immutableFields: attemptedImmutableUpdates,
                message: "The following fields are immutable and cannot be updated: " + attemptedImmutableUpdates.join(', ')
            }, { status: 400 });
        }

        
        allowedFields.forEach(field => {
            if (requestBody.hasOwnProperty(field)) {
                updateData[field] = requestBody[field];
            }
        });

        
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({
                error: "No valid fields provided for update",
                message: "Only 'status' and 'effectivePeriod' fields can be updated"
            }, { status: 400 });
        }

        
        const medicationResource = {
            resourceType: "Medication",
            id,
            ...updateData
        };

        const res = await fetch(`${process.env.BASE_URL}/apiportal/ema/fhir/v2/Medication/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/fhir+json",
                "accept": "application/fhir+json",
                "authorization": `Bearer ${access_token?.value}`,
                "x-api-key": `${process.env.API_KEY}`
            },
            body: JSON.stringify(medicationResource)
        });

        if (!res.ok) {
            throw new Error(`API request failed with status: ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json({
            ...data,
            message: "Medication updated successfully. Note: Changes require reconciliation by the Practice before being added to the Patient's chart."
        });
    } catch (error) {
        console.error("Error updating medication:", error);
        return NextResponse.json({
            message: "Error updating medication", 
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}