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
    const code = searchParams.get("code");
    const identifier = searchParams.get("identifier");
    const page = searchParams.get("page");
    const status = searchParams.get("status");
    const form = searchParams.get("form");
    const ingredient = searchParams.get("ingredient");
    const ingredientCode = searchParams.get("ingredient-code");

    
    const queryParams: Record<string, string> = {};

    
    if (count) queryParams._count = count;
    if (lastUpdated) queryParams._lastUpdated = lastUpdated;
    if (code) queryParams.code = code;
    if (identifier) queryParams.identifier = identifier;
    if (page) queryParams.page = page;
    if (status) queryParams.status = status;
    if (form) queryParams.form = form;
    if (ingredient) queryParams.ingredient = ingredient;
    if (ingredientCode) queryParams["ingredient-code"] = ingredientCode;

    
    const queryString = new URLSearchParams(queryParams).toString();
    const apiUrl = `${process.env.BASE_URL}/apiportal/ema/fhir/v2/Medication${queryString ? `?${queryString}` : ''}`;

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
        console.error("Error fetching medications:", error);
        return NextResponse.json(
            { message: "Error fetching medications", error: error instanceof Error ? error.message : "Unknown error" },
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
            status,
            subject,
            medicationCodeableConcept,
            effectivePeriod,
            dosage
        } = await req.json();

        
        if (!subject) {
            return NextResponse.json({
                error: "Missing required field",
                message: "subject (patient reference) is required"
            }, { status: 400 });
        }

        if (!medicationCodeableConcept) {
            return NextResponse.json({
                error: "Missing required field",
                message: "medicationCodeableConcept is required"
            }, { status: 400 });
        }

            
        const medicationStatementResource = {
            resourceType: "MedicationStatement",
            status: status || "active", 
            subject,
            medicationCodeableConcept,
            ...(effectivePeriod && { effectivePeriod }),
            ...(dosage && { dosage })
        };

        const res = await fetch(`${process.env.BASE_URL}/apiportal/ema/fhir/v2/MedicationStatement`, {
            method: "POST",
            headers: {
                "Content-Type": "application/fhir+json",
                "accept": "application/fhir+json",
                "authorization": `Bearer ${access_token.value}`,
                "x-api-key": `${process.env.API_KEY}`
            },
            body: JSON.stringify(medicationStatementResource)
        });

        if (!res.ok) {
            throw new Error(`API request failed with status: ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json({
            ...data,
            message: "MedicationStatement created successfully. Note: Changes require reconciliation by the Practice before being added to the Patient's chart."
        }, { status: 201 });
    } catch (error) {
        console.error("Error creating medication statement:", error);
        return NextResponse.json(
            { message: "Error creating medication statement", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
