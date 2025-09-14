import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get("code");
    if(!code) return NextResponse.json({error: "Missing code"}, {status: 400});

    const res = await fetch(`${process.env.BASE_URL}/o/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri:process.env.REDIRECT_URI!,
            client_id: process.env.CLIENT_ID!,
            client_secret: process.env.CLIENT_SECRET!
        })

    })

    const tokenData = await res.json();

    const cookieStore = await cookies();

    cookieStore.set("access_token", tokenData.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: tokenData.expires_in
    });

    cookieStore.set("refresh_token", tokenData.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 30 //30 days
    })



    return NextResponse.json({message:"Token store successfully"});


}