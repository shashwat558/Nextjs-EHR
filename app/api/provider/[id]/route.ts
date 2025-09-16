import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, {params}: {params: Promise<{id: string}>}) {
    const {id} = await params;

    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token")?.value;

    try {
        const res = await fetch(`${process.env.BASE_URL}/apiportal/ema/fhir/v2/Practitioner/${id}`, {
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
        return NextResponse.json({message: "Error getting provider"}, {status: 500});
    }
    
    
}