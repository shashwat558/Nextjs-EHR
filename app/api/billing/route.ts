import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.BASE_URL;

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const access_token = cookieStore.get("access_token")?.value;

  if (!access_token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patient");
  const _count = searchParams.get("_count") || "50";

  const apiUrl = `${BASE_URL}/apiportal/ema/fhir/v2/ChargeItem?_count=${_count}${patientId ? `&subject=Patient/${patientId}` : ''}`;

  try {
    const res = await fetch(apiUrl, {
      headers: {
        accept: "application/fhir+json",
        authorization: `Bearer ${access_token}`,
        "x-api-key": `${process.env.API_KEY}`
      }
    });

    if (!res.ok) {
      throw new Error(`API request failed: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching charges:", error);
    
    // Return mock data if API is unavailable
    const mockData = {
      resourceType: "Bundle",
      type: "searchset",
      total: 3,
      entry: [
        {
          fullUrl: "https://your-base-url/apiportal/ema/fhir/v2/ChargeItem/charge-001",
          resource: {
            resourceType: "ChargeItem",
            id: "charge-001",
            status: "billable",
            subject: { reference: "Patient/67890", display: "John Doe" },
            context: { reference: "Encounter/enc-001" },
            occurrenceDateTime: "2025-01-15T10:30:00Z",
            totalCost: { value: 150.00, currency: "USD" },
            financialTransactionDetail: [{
              description: "Office Visit - Level 3",
              unitCost: { value: 150.00, currency: "USD" },
              quantity: { valueDecimal: 1 },
              code: {
                coding: [{
                  system: "http://www.ama-assn.org/go/cpt",
                  code: "99213",
                  display: "Office Visit Level 3"
                }]
              }
            }]
          }
        },
        {
          fullUrl: "https://your-base-url/apiportal/ema/fhir/v2/ChargeItem/charge-002",
          resource: {
            resourceType: "ChargeItem",
            id: "charge-002",
            status: "billable",
            subject: { reference: "Patient/67890", display: "John Doe" },
            context: { reference: "Encounter/enc-002" },
            occurrenceDateTime: "2025-01-14T14:15:00Z",
            totalCost: { value: 75.00, currency: "USD" },
            financialTransactionDetail: [{
              description: "Laboratory Test - CBC",
              unitCost: { value: 75.00, currency: "USD" },
              quantity: { valueDecimal: 1 },
              code: {
                coding: [{
                  system: "http://www.ama-assn.org/go/cpt",
                  code: "85025",
                  display: "Complete Blood Count"
                }]
              }
            }]
          }
        },
        {
          fullUrl: "https://your-base-url/apiportal/ema/fhir/v2/ChargeItem/charge-003",
          resource: {
            resourceType: "ChargeItem",
            id: "charge-003",
            status: "billable",
            subject: { reference: "Patient/12345", display: "Jane Smith" },
            context: { reference: "Encounter/enc-003" },
            occurrenceDateTime: "2025-01-13T09:00:00Z",
            totalCost: { value: 200.00, currency: "USD" },
            financialTransactionDetail: [{
              description: "Specialist Consultation",
              unitCost: { value: 200.00, currency: "USD" },
              quantity: { valueDecimal: 1 },
              code: {
                coding: [{
                  system: "http://www.ama-assn.org/go/cpt",
                  code: "99243",
                  display: "Office Consultation Level 3"
                }]
              }
            }]
          }
        }
      ]
    };
    
    return NextResponse.json(mockData);
  }
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const access_token = cookieStore.get("access_token")?.value;

  if (!access_token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      patientId,
      providerId,
      description,
      code,
      cost,
      currency,
      encounterId
    } = await req.json();

    const chargeItem = {
      resourceType: "ChargeItem",
      status: "billable",
      subject: { reference: `Patient/${patientId}` },
      context: { reference: `Encounter/${encounterId}` },
      occurrenceDateTime: new Date().toISOString(),
      totalCost: { value: cost, currency },
      attendingProviderId: providerId,
      financialTransactionDetail: [
        {
          description,
          unitCost: { value: cost, currency },
          quantity: { valueDecimal: 1 },
          code: {
            coding: [
              {
                system: "http://www.ama-assn.org/go/cpt",
                code,
                display: description
              }
            ]
          }
        }
      ]
    };

    const res = await fetch(`${BASE_URL}/apiportal/ema/fhir/v2/ChargeItem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/fhir+json",
        authorization: `Bearer ${access_token}`,
        "x-api-key": `${process.env.API_KEY}`
      },
      body: JSON.stringify(chargeItem)
    });

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating charge:", error);
    return NextResponse.json({ error: "Failed to create charge" }, { status: 500 });
  }
}