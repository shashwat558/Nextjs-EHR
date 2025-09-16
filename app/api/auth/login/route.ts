import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    const {username, password} = await req.json();

    const res = await fetch(process.env.MOCK_MOD_MED_AUTH_URL!, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "accept": "application/json",
            'x-api-key': process.env.API_KEY!
        
        },
        body: new URLSearchParams({
            grant_type: "password",
            username,
            password
        }),
    });

    const tokenData = await res.json();

    if(!res.ok){
        return NextResponse.json({error: tokenData}, {status: res.status});
    };

    const cookieStore = await cookies();

    cookieStore.set("access_token", tokenData.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: tokenData.expires_in
    });

    cookieStore.set("refresh_token", tokenData.refresh_token, {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
        maxAge: 60 * 60 * 24 * 30 //30 days
    });

    return NextResponse.json({message: "Login successfull", tokenData})
}