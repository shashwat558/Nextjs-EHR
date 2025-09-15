import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token");

    if (!access_token) {
        return NextResponse.json({ error: "No access token found" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    
    // Extract all search parameters
    const count = searchParams.get("_count");
    const lastUpdated = searchParams.get("_lastUpdated");
    const active = searchParams.get("active");
    const email = searchParams.get("email");
    const family = searchParams.get("family");
    const given = searchParams.get("given");
    const identifier = searchParams.get("identifier");
    const page = searchParams.get("page");
    const phone = searchParams.get("phone");
    const type = searchParams.get("type");

   
    const queryParams: Record<string, string> = {};

    
    if (count) queryParams._count = count;
    if (lastUpdated) queryParams._lastUpdated = lastUpdated;
    if (active) queryParams.active = active;
    if (email) queryParams.email = email;
    if (family) queryParams.family = family;
    if (given) queryParams.given = given;
    if (identifier) queryParams.identifier = identifier;
    if (page) queryParams.page = page;
    if (phone) queryParams.phone = phone;
    if (type) queryParams.type = type;

    
    const queryString = new URLSearchParams(queryParams).toString();
    const apiUrl = `${process.env.BASE_URL}/apiportal/ema/fhir/v2/Practitioner${queryString ? `?${queryString}` : ''}`;

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
        console.error("Error fetching providers:", error);
        return NextResponse.json(
            { message: "Error fetching providers", error: error instanceof Error ? error.message : "Unknown error" },
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
            address,
            qualification,
            communication
        } = await req.json();

        
        const practitionerResource = {
            resourceType: "Practitioner",
            ...(identifier && { identifier }),
            ...(active !== undefined && { active }),
            ...(name && { name }),
            ...(telecom && { telecom }),
            ...(gender && { gender }),
            ...(birthDate && { birthDate }),
            ...(address && { address }),
            ...(qualification && { qualification }),
            ...(communication && { communication })
        };

        const res = await fetch(`${process.env.BASE_URL}/apiportal/ema/fhir/v2/Practitioner`, {
            method: "POST",
            headers: {
                "Content-Type": "application/fhir+json",
                "accept": "application/fhir+json",
                "authorization": `Bearer ${access_token.value}`,
                "x-api-key": `${process.env.API_KEY}`
            },
            body: JSON.stringify(practitionerResource)
        });

        if (!res.ok) {
            throw new Error(`API request failed with status: ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Error creating provider:", error);
        return NextResponse.json(
            { message: "Error creating provider", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

// export async function PUT(req: NextRequest) {
//     const cookieStore = await cookies();
//     const access_token = cookieStore.get("access_token");

//     if (!access_token) {
//         return NextResponse.json({ error: "No access token found" }, { status: 401 });
//     }

//     try {
//         const {
//             id,
//             identifier,
//             active,
//             name,
//             telecom,
//             gender,
//             birthDate,
//             address,
//             qualification,
//             communication
//         } = await req.json();

//         if (!id) {
//             return NextResponse.json({ error: "Provider ID is required for update" }, { status: 400 });
//         }

       
//         const practitionerResource = {
//             resourceType: "Practitioner",
//             id,
//             ...(identifier && { identifier }),
//             ...(active !== undefined && { active }),
//             ...(name && { name }),
//             ...(telecom && { telecom }),
//             ...(gender && { gender }),
//             ...(birthDate && { birthDate }),
//             ...(address && { address }),
//             ...(qualification && { qualification }),
//             ...(communication && { communication })
//         };

//         const res = await fetch(`${process.env.BASE_URL}/apiportal/ema/fhir/v2/Practitioner/${id}`, {
//             method: "PUT",
//             headers: {
//                 "Content-Type": "application/fhir+json",
//                 "accept": "application/fhir+json",
//                 "authorization": `Bearer ${access_token.value}`,
//                 "x-api-key": `${process.env.API_KEY}`
//             },
//             body: JSON.stringify(practitionerResource)
//         });

//         if (!res.ok) {
//             throw new Error(`API request failed with status: ${res.status}`);
//         }

//         const data = await res.json();
//         return NextResponse.json(data);
//     } catch (error) {
//         console.error("Error updating provider:", error);
//         return NextResponse.json(
//             { message: "Error updating provider", error: error instanceof Error ? error.message : "Unknown error" },
//             { status: 500 }
//         );
//     }
// }


