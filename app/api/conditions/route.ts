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
    const clinicalStatus = searchParams.get("clinical-status");
    const verificationStatus = searchParams.get("verification-status");
    const category = searchParams.get("category");
    const severity = searchParams.get("severity");
    const onsetDate = searchParams.get("onset-date");
    const recordedDate = searchParams.get("recorded-date");
    const code = searchParams.get("code");
    const identifier = searchParams.get("identifier");

    
    const queryParams: Record<string, string> = {};

    
    if (count) queryParams._count = count;
    if (page) queryParams.page = page;
    if (patient) queryParams.patient = patient;
    if (lastUpdated) queryParams._lastUpdated = lastUpdated;
    if (clinicalStatus) queryParams["clinical-status"] = clinicalStatus;
    if (verificationStatus) queryParams["verification-status"] = verificationStatus;
    if (category) queryParams.category = category;
    if (severity) queryParams.severity = severity;
    if (onsetDate) queryParams["onset-date"] = onsetDate;
    if (recordedDate) queryParams["recorded-date"] = recordedDate;
    if (code) queryParams.code = code;
    if (identifier) queryParams.identifier = identifier;

    
    const queryString = new URLSearchParams(queryParams).toString();
    const apiUrl = `${process.env.BASE_URL}/apiportal/ema/fhir/v2/Condition${queryString ? `?${queryString}` : ''}`;

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
        console.error("Error fetching conditions:", error);
        return NextResponse.json(
            { message: "Error fetching conditions", error: error instanceof Error ? error.message : "Unknown error" },
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
            ...(clinicalStatus && { clinicalStatus }),
            ...(subject && { subject }),
            ...(code && { code }),
            ...(onset && { onset }),
            ...(recordedDate && { recordedDate }),
            ...(processedCategory && { category: processedCategory })
        };

        const res = await fetch(`${process.env.BASE_URL}/apiportal/ema/fhir/v2/Condition`, {
            method: "POST",
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
            message: "Condition created successfully. Note: Changes require reconciliation by the Practice before being added to the Patient's chart."
        }, { status: 201 });
    } catch (error) {
        console.error("Error creating condition:", error);
        return NextResponse.json(
            { message: "Error creating condition", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token");

    if (!access_token) {
        return NextResponse.json({ error: "No access token found" }, { status: 401 });
    }

    try {
        const {
            id,
            clinicalStatus,
            subject,
            code,
            onset,
            recordedDate,
            category
        } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "Condition ID is required for update" }, { status: 400 });
        }

        
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
        return NextResponse.json(
            { message: "Error updating condition", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
