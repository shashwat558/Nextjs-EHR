import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore =await cookies();
        
    const refreshToken = cookieStore.get("refresh_token")?.value;

        if(!refreshToken){
            return NextResponse.json({error:"No refresh token found"}, {status: 401})
        };

        const res = await fetch(`${process.env.BASE_URL}/o/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-urlencoded",
                "x-api-key": process.env.API_KEY!
            },
            body: new URLSearchParams({
                "grant_type": "refresh_token",
                refresh_token: refreshToken
            })
        });

        const tokenData = await res.json();
        if(!res.ok) {
            return NextResponse.json({error: tokenData}, {status: res.status});
        }

       

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
        });

        return NextResponse.json({message: "Access token refreshed"})

    
}