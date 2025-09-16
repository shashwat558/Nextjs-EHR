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


export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  const cookieStore =await cookies();
  const access_token = cookieStore.get("access_token")?.value;

  if (!access_token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  
  const { name, email, phone, dob, address, emergencyContact, status } = await req.json();

  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patientResource: Record<string, any> = {
    resourceType: "Patient",
    id,
    ...(name && {
      name: [
        {
          family: name.family,
          given: [name.given]
        }
      ]
    }),
    ...(dob && { birthDate: dob }),
    ...(status && { active: status === "active" }),
    ...(address && {
      address: [
        {
          line: [address.line],
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country
        }
      ]
    }),
    telecom: [],
    contact: []
  };

  if (phone) {
    patientResource.telecom.push({ system: "phone", value: phone, use: "mobile" });
  }
  if (email) {
    patientResource.telecom.push({ system: "email", value: email });
  }
  if (emergencyContact) {
    patientResource.contact.push({
      name: {
        family: emergencyContact.family,
        given: [emergencyContact.given]
      },
      telecom: [
        { system: "phone", value: emergencyContact.phone },
        { system: "email", value: emergencyContact.email }
      ],
      relationship: [{ text: emergencyContact.relationship }]
    });
  }

  try {
    const res = await fetch(`${process.env.BASE_URL}/apiportal/ema/fhir/v2/Patient/${id}`, {
      method: "PUT",
      headers: {
        "accept": "application/fhir+json",
        "content-type": "application/fhir+json",
        authorization: `Bearer ${access_token}`,
        "x-api-key": process.env.API_KEY!
      },
      body: JSON.stringify(patientResource)
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json(
      { message: "Error updating patient", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}