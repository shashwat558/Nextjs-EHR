import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, {params}: {params: Promise<{id: string}>}) {
    const {id} = await params;

    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token");

    if (!access_token) {
        return NextResponse.json({ error: "No access token found" }, { status: 401 });
    }
    
    try {
        const res = await fetch(`${process.env.BASE_URL}/apiportal/ema/fhir/v2/Condition/${id}`, {
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
        console.error("Error getting condition:", error);
        return NextResponse.json({
            message: "Error getting condition", 
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, {params}: {params: Promise<{id: string}>}) {
    const {id} = await params;

    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token");

    if (!access_token) {
        return NextResponse.json({ error: "No access token found" }, { status: 401 });
    }

    try {
        const {
            clinicalStatus,
            subject,
            code,
            onset,
            recordedDate,
            category
        } = await req.json();

        
        const mapCategory = (categoryValue: string) => {
            const categoryMap: Record<string, {code: string, display: string}> = {
                'Problem': {code: 'problem-list-item', display: 'Problem List Item'},
                'Condition': {code: 'encounter-diagnosis', display: 'Encounter Diagnosis'},
                'Diagnosis': {code: 'encounter-diagnosis', display: 'Encounter Diagnosis'},
                'Symptom': {code: 'symptom', display: 'Symptom'},
                'Finding': {code: 'finding', display: 'Finding'},
                'Complaint': {code: 'complaint', display: 'Complaint'},
                'Functional Limitation': {code: 'functional-limitation', display: 'Functional Limitation'},
                'Health Status': {code: 'health-status', display: 'Health Status'}
            };
            return categoryMap[categoryValue] || {code: 'problem-list-item', display: 'Problem List Item'};
        };

        
        let processedCategory = category;
        if (category && typeof category === 'string') {
            const mappedCategory = mapCategory(category);
            processedCategory = [{
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/condition-category",
                    code: mappedCategory.code,
                    display: mappedCategory.display
                }]
            }];
        }

        
        const conditionResource = {
            resourceType: "Condition",
            id,
            ...(clinicalStatus && { clinicalStatus }),
            ...(subject && { subject }),
            ...(code && { code }),
            ...(onset && { onset }),
            ...(recordedDate && { recordedDate }),
            ...(processedCategory && { category: processedCategory })
        };

        const res = await fetch(`${process.env.BASE_URL}/apiportal/ema/fhir/v2/Condition/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/fhir+json",
                "accept": "application/fhir+json",
                "authorization": `Bearer ${access_token.value}`,
                "x-api-key": `${process.env.API_KEY}`
            },
            body: JSON.stringify(conditionResource)
        });

        if (!res.ok) {
            throw new Error(`API request failed with status: ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json({
            ...data,
            message: "Condition updated successfully. Note: Changes require reconciliation by the Practice before being added to the Patient's chart."
        });
    } catch (error) {
        console.error("Error updating condition:", error);
        return NextResponse.json({
            message: "Error updating condition", 
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}