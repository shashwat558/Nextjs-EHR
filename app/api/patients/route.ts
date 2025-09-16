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
    const addressPostalCode = searchParams.get("address-postalcode");
    const active = searchParams.get("active");
    const birthdate = searchParams.get("birthdate");
    const email = searchParams.get("email");
    const family = searchParams.get("family");
    const gender = searchParams.get("gender");
    const generalPractitioner = searchParams.get("general-practitioner");
    const given = searchParams.get("given");
    const identifier = searchParams.get("identifier");
    const language = searchParams.get("language");
    const page = searchParams.get("page");
    const phone = searchParams.get("phone");
    const usCoreEthnicity = searchParams.get("us-core-ethnicity");
    const usCoreRace = searchParams.get("us-core-race");
    const referralSource = searchParams.get("referral-source");

    
    const queryParams: Record<string, string> = {};

    
    if (count) queryParams._count = count;
    if (lastUpdated) queryParams._lastUpdated = lastUpdated;
    if (addressPostalCode) queryParams["address-postalcode"] = addressPostalCode;
    if (active) queryParams.active = active;
    if (birthdate) queryParams.birthdate = birthdate;
    if (email) queryParams.email = email;
    if (family) queryParams.family = family;
    if (gender) queryParams.gender = gender;
    if (generalPractitioner) queryParams["general-practitioner"] = generalPractitioner;
    if (given) queryParams.given = given;
    if (identifier) queryParams.identifier = identifier;
    if (language) queryParams.language = language;
    if (page) queryParams.page = page;
    if (phone) queryParams.phone = phone;
    if (usCoreEthnicity) queryParams["us-core-ethnicity"] = usCoreEthnicity;
    if (usCoreRace) queryParams["us-core-race"] = usCoreRace;
    if (referralSource) queryParams["referral-source"] = referralSource;

    
    const queryString = new URLSearchParams(queryParams).toString();
    const apiUrl = `${process.env.BASE_URL}/apiportal/ema/fhir/v2/Patient${queryString ? `?${queryString}` : ''}`;
    console.log(apiUrl);

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
        console.error("Error fetching patients:", error);
        return NextResponse.json(
            { message: "Error fetching patients", error: error instanceof Error ? error.message : "Unknown error" },
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
            active,
            name,
            telecom,
            gender,
            birthDate,
            deceasedBoolean,
            address,
            maritalStatus,
            contact,
            communication,
            race,
            ethnicity,
            generalPractitioner,
            referralSource
        } = await req.json();

        
        const patientResource = {
            resourceType: "Patient",
            ...(identifier && { identifier }),
            ...(active !== undefined && { active }),
            ...(name && { name }),
            ...(telecom && { telecom }),
            ...(gender && { gender }),
            ...(birthDate && { birthDate }),
            ...(deceasedBoolean !== undefined && { deceasedBoolean }),
            ...(address && { address }),
            ...(maritalStatus && { maritalStatus }),
            ...(contact && { contact }),
            ...(communication && { communication }),
            ...(generalPractitioner && { generalPractitioner }),
            ...(referralSource && { referralSource }),
            // Add extensions for race and ethnicity if provided
            ...((race || ethnicity) && {
                extension: [
                    ...(race ? [{
                        url: "http://hl7.org/fhir/us/core/STU3.1/StructureDefinition-us-core-race.html",
                        valueCodeableConcept: race
                    }] : []),
                    ...(ethnicity ? [{
                        url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity",
                        valueCodeableConcept: ethnicity
                    }] : [])
                ]
            })
        };

        const headers: Record<string, string> = {
            "Content-Type": "application/fhir+json",
            "accept": "application/fhir+json",
            "authorization": `Bearer ${access_token.value}`,
            "x-api-key": `${process.env.API_KEY}`
        };

        
        const contentFlag = req.headers.get("Content-Flag");
        if (contentFlag) {
            headers["Content-Flag"] = contentFlag;
        }

        const res = await fetch(`${process.env.BASE_URL}/apiportal/ema/fhir/v2/Patient`, {
            method: "POST",
            headers,
            body: JSON.stringify(patientResource)
        });

        if (!res.ok) {
            throw new Error(`API request failed with status: ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Error creating patient:", error);
        return NextResponse.json(
            { message: "Error creating patient", error: error instanceof Error ? error.message : "Unknown error" },
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
            active,
            name,
            telecom,
            gender,
            birthDate,
            deceasedBoolean,
            address,
            maritalStatus,
            contact,
            communication,
            race,
            ethnicity,
            generalPractitioner,
            referralSource
        } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "Patient ID is required for update" }, { status: 400 });
        }

        
        const patientResource = {
            resourceType: "Patient",
            id,
            ...(identifier && { identifier }),
            ...(active !== undefined && { active }),
            ...(name && { name }),
            ...(telecom && { telecom }),
            ...(gender && { gender }),
            ...(birthDate && { birthDate }),
            ...(deceasedBoolean !== undefined && { deceasedBoolean }),
            ...(address && { address }),
            ...(maritalStatus && { maritalStatus }),
            ...(contact && { contact }),
            ...(communication && { communication }),
            ...(generalPractitioner && { generalPractitioner }),
            ...(referralSource && { referralSource }),
            
            ...((race || ethnicity) && {
                extension: [
                    ...(race ? [{
                        url: "http://hl7.org/fhir/us/core/STU3.1/StructureDefinition-us-core-race.html",
                        valueCodeableConcept: race
                    }] : []),
                    ...(ethnicity ? [{
                        url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity",
                        valueCodeableConcept: ethnicity
                    }] : [])
                ]
            })
        };

        const headers: Record<string, string> = {
            "Content-Type": "application/fhir+json",
            "accept": "application/fhir+json",
            "authorization": `Bearer ${access_token.value}`,
            "x-api-key": `${process.env.API_KEY}`
        };

        
        const contentFlag = req.headers.get("Content-Flag");
        if (contentFlag) {
            headers["Content-Flag"] = contentFlag;
        }

        const res = await fetch(`${process.env.BASE_URL}/apiportal/ema/fhir/v2/Patient/${id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(patientResource)
        });

        if (!res.ok) {
            throw new Error(`API request failed with status: ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error updating patient:", error);
        return NextResponse.json(
            { message: "Error updating patient", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}