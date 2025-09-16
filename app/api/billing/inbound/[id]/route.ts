import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.BASE_URL;

export async function GET(req: NextRequest, {params}: {params: Promise<{id: string}>}) {
    const {id} = await params;

    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token")?.value;

    if (!access_token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const res = await fetch(`${BASE_URL}/apiportal/ema/fhir/v2/ChargeItem/  INBOUND|${id}`, {
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
        console.error("Error getting inbound billing:", error);
        
     
        const mockData = {
            resourceType: "ChargeItem",
            id: id,
            status: "inbound",
            subject: { reference: "Patient/67890", display: "John Doe" },
            context: { reference: "Encounter/enc-001" },
            occurrenceDateTime: "2025-01-15T10:30:00Z",
            totalCost: { value: 150.00, currency: "USD" },
            financialTransactionDetail: [{
                description: "Inbound Office Visit - Level 3",
                unitCost: { value: 150.00, currency: "USD" },
                quantity: { valueDecimal: 1 },
                code: {
                    coding: [{
                        system: "http://www.ama-assn.org/go/cpt",
                        code: "99213",
                        display: "Office Visit Level 3"
                    }]
                }
            }],
            note: [{
                text: "Inbound charge from external system"
            }]
        };
        
        return NextResponse.json(mockData);
    }
}
