import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, {params}: {params: {id: string}}) {
    const {id} = params;

    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token");




    try{
        const res = await fetch(`${process.env.BASE_URL}/apiportal/ema/fhir/v2/Patient/${id}`, {
        headers: {
            accept: "application/json",
            authorization: `Bearer ${access_token}`,
            'x-api-key': `${process.env.API_KEY}`
        },

    });

    

    const data = await res.json();

    return NextResponse.json(data)
   } catch(error){
      console.error(error);
      return NextResponse.json({message: "Error getting patient"});

   }


    
}


export async function PUT(req: NextRequest, {params}: {params: {id: string}}) {
    const {id} = params;

    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token")?.value;

    const {name, email, phone, dob, address, emergencyContact, status} = await req.json();
    

    try{
        const res = await fetch(`${process.env.BASE_URL}/apiportal/ema/fhir/v2/Patient/${id}`, {
            method: "PUT",
            headers: {
                accept: "application/json",
                authorization: `Bearer ${access_token}`,
                'x-api-key': `${process.env.API_KEY}`
            },
            body: JSON.stringify({
                name,
                email,
                phone,
                dob,
                address,
                emergencyContact,
                status
            })
        });

        const data = await res.json();

        return NextResponse.json(data);
    } catch(error){
        console.error(error);
        return NextResponse.json({message: "Error updating patient"});
    }
}