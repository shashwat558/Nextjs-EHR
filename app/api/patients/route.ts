import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token")?.value;

    if(!access_token){
        return NextResponse.json({error: "No access token found"}, {status: 401});
    };

    const res = await fetch(`${process.env.BASE_URL}/api/patient`);
    const patients = await res.json();

    return NextResponse.json(patients)
}