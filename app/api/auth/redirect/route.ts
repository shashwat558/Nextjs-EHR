import { NextResponse } from "next/server";

export async function GET() {
    const clientId = process.env.CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.REDIRECT_URI!);
    const scope = encodeURIComponent("patients:read patient:write clinical:read clinical:write appointments:read appointments:write doctors:read billing:read billing:write report:read");

    const authUrl = `${process.env.BASE_URL}/o/authorize/?redirect_uri=${redirectUri}&response_type=code&client_id=${clientId}&scope=${scope}`;


    return NextResponse.redirect(authUrl);
}