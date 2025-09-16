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
    const lastUpdated = searchParams.get("_lastUpdated");
    const encounter = searchParams.get("encounter");
    const page = searchParams.get("page");
    const patient = searchParams.get("patient");
    const requisition = searchParams.get("requisition");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const date = searchParams.get("date");
    const code = searchParams.get("code");
    const identifier = searchParams.get("identifier");

    
    const queryParams: Record<string, string> = {};

    
    if (count) queryParams._count = count;
    if (lastUpdated) queryParams._lastUpdated = lastUpdated;
    if (encounter) queryParams.encounter = encounter;
    if (page) queryParams.page = page;
    if (patient) queryParams.patient = patient;
    if (requisition) queryParams.requisition = requisition;
    if (type) queryParams.type = type;
    if (status) queryParams.status = status;
    if (category) queryParams.category = category;
    if (date) queryParams.date = date;
    if (code) queryParams.code = code;
    if (identifier) queryParams.identifier = identifier;

    
    const queryString = new URLSearchParams(queryParams).toString();
    const apiUrl = `${process.env.BASE_URL}/apiportal/ema/fhir/v2/DiagnosticReport${queryString ? `?${queryString}` : ''}`;

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
        console.error("Error fetching diagnostic reports:", error);
        return NextResponse.json(
            { message: "Error fetching diagnostic reports", error: error instanceof Error ? error.message : "Unknown error" },
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
            identifier,
            basedOn,
            status,
            category,
            code,
            subject,
            encounter,
            effectiveDateTime,
            effectivePeriod,
            issued,
            performer,
            resultsInterpreter,
            specimen,
            result,
            imagingStudy,
            media,
            conclusion,
            conclusionCode,
            presentedForm
        } = await req.json();

        
        const diagnosticReportResource = {
            resourceType: "DiagnosticReport",
            ...(identifier && { identifier }),
            ...(basedOn && { basedOn }),
            ...(status && { status }),
            ...(category && { category }),
            ...(code && { code }),
            ...(subject && { subject }),
            ...(encounter && { encounter }),
            ...(effectiveDateTime && { effectiveDateTime }),
            ...(effectivePeriod && { effectivePeriod }),
            ...(issued && { issued }),
            ...(performer && { performer }),
            ...(resultsInterpreter && { resultsInterpreter }),
            ...(specimen && { specimen }),
            ...(result && { result }),
            ...(imagingStudy && { imagingStudy }),
            ...(media && { media }),
            ...(conclusion && { conclusion }),
            ...(conclusionCode && { conclusionCode }),
            ...(presentedForm && { presentedForm })
        };

        const res = await fetch(`${process.env.BASE_URL}/apiportal/ema/fhir/v2/DiagnosticReport`, {
            method: "POST",
            headers: {
                "Content-Type": "application/fhir+json",
                "accept": "application/fhir+json",
                "authorization": `Bearer ${access_token.value}`,
                "x-api-key": `${process.env.API_KEY}`
            },
            body: JSON.stringify(diagnosticReportResource)
        });

        if (!res.ok) {
            throw new Error(`API request failed with status: ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Error creating diagnostic report:", error);
        return NextResponse.json(
            { message: "Error creating diagnostic report", error: error instanceof Error ? error.message : "Unknown error" },
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
            identifier,
            basedOn,
            status,
            category,
            code,
            subject,
            encounter,
            effectiveDateTime,
            effectivePeriod,
            issued,
            performer,
            resultsInterpreter,
            specimen,
            result,
            imagingStudy,
            media,
            conclusion,
            conclusionCode,
            presentedForm
        } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "DiagnosticReport ID is required for update" }, { status: 400 });
        }

    
        const diagnosticReportResource = {
            resourceType: "DiagnosticReport",
            id,
            ...(identifier && { identifier }),
            ...(basedOn && { basedOn }),
            ...(status && { status }),
            ...(category && { category }),
            ...(code && { code }),
            ...(subject && { subject }),
            ...(encounter && { encounter }),
            ...(effectiveDateTime && { effectiveDateTime }),
            ...(effectivePeriod && { effectivePeriod }),
            ...(issued && { issued }),
            ...(performer && { performer }),
            ...(resultsInterpreter && { resultsInterpreter }),
            ...(specimen && { specimen }),
            ...(result && { result }),
            ...(imagingStudy && { imagingStudy }),
            ...(media && { media }),
            ...(conclusion && { conclusion }),
            ...(conclusionCode && { conclusionCode }),
            ...(presentedForm && { presentedForm })
        };

        const res = await fetch(`${process.env.BASE_URL}/apiportal/ema/fhir/v2/DiagnosticReport/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/fhir+json",
                "accept": "application/fhir+json",
                "authorization": `Bearer ${access_token.value}`,
                "x-api-key": `${process.env.API_KEY}`
            },
            body: JSON.stringify(diagnosticReportResource)
        });

        if (!res.ok) {
            throw new Error(`API request failed with status: ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error updating diagnostic report:", error);
        return NextResponse.json(
            { message: "Error updating diagnostic report", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
