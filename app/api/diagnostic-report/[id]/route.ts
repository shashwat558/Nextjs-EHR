import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, {params}: {params: {id: string}}) {
    const {id} = params;

    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token");

    if (!access_token) {
        return NextResponse.json({ error: "No access token found" }, { status: 401 });
    };

    try {
        const res = await fetch(`${process.env.BASE_URL}/apiportal/ema/fhir/v2/DiagnosticReport/${id}`, {
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
        console.error("Error getting diagnostic report:", error);
        return NextResponse.json({
            message: "Error getting diagnostic report", 
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}