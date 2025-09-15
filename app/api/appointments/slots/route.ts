import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token");

    if (!access_token) {
        return NextResponse.json({ error: "No access token found" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    
    
    const appointmentType = searchParams.get("appointment-type");
    const date = searchParams.get("date");
    const identifier = searchParams.get("identifier");
    const count = searchParams.get("_count");
    const page = searchParams.get("page");
    const lastUpdated = searchParams.get("_lastUpdated");
    const status = searchParams.get("status");
    const schedule = searchParams.get("schedule");
    const serviceType = searchParams.get("service-type");
    const serviceCategory = searchParams.get("service-category");

    
    if (!appointmentType) {
        return NextResponse.json({
            error: "Missing required parameter",
            message: "appointment-type is required"
        }, { status: 400 });
    }

    
    const queryParams: Record<string, string> = {};

    
    queryParams["appointment-type"] = appointmentType;

    
    if (date) queryParams.date = date;
    if (identifier) queryParams.identifier = identifier;
    if (count) queryParams._count = count;
    if (page) queryParams.page = page;
    if (lastUpdated) queryParams._lastUpdated = lastUpdated;
    if (status) queryParams.status = status;
    if (schedule) queryParams.schedule = schedule;
    if (serviceType) queryParams["service-type"] = serviceType;
    if (serviceCategory) queryParams["service-category"] = serviceCategory;


    const queryString = new URLSearchParams(queryParams).toString();
    const apiUrl = `${process.env.BASE_URL}/apiportal/ema/fhir/v2/Slot?${queryString}`;

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
        console.error("Error fetching slots:", error);
        return NextResponse.json(
            { message: "Error fetching slots", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}