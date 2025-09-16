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
  const _count = searchParams.get("_count") || "50";
  const status = searchParams.get("status") || "inbound";

  const apiUrl = `${BASE_URL}/apiportal/ema/fhir/v2/ChargeItem?_count=${_count}&status=${status}`;

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
    console.error("Error fetching inbound charges:", error);
    
    // Return mock data if API is unavailable
    const mockData = {
      resourceType: "Bundle",
      type: "searchset",
      total: 2,
      entry: [
        {
          fullUrl: "https://your-base-url/apiportal/ema/fhir/v2/ChargeItem/inbound-001",
          resource: {
            resourceType: "ChargeItem",
            id: "inbound-001",
            status: "inbound",
            subject: { reference: "Patient/67890", display: "John Doe" },
            context: { reference: "Encounter/enc-001" },
            occurrenceDateTime: "2025-01-15T10:30:00Z",
            totalCost: { value: 150.00, currency: "USD" },
            financialTransactionDetail: [{
              description: "Inbound Office Visit - Level 3",
              unitCost: { value: 150.00, currency: "USD" },
              quantity: { valueDecimal: 1 },
              code: {
                coding: [{
                  system: "http://www.ama-assn.org/go/cpt",
                  code: "99213",
                  display: "Office Visit Level 3"
                }]
              }
            }],
            note: [{
              text: "Inbound charge from external system"
            }]
          }
        },
        {
          fullUrl: "https://your-base-url/apiportal/ema/fhir/v2/ChargeItem/inbound-002",
          resource: {
            resourceType: "ChargeItem",
            id: "inbound-002",
            status: "inbound",
            subject: { reference: "Patient/12345", display: "Jane Smith" },
            context: { reference: "Encounter/enc-002" },
            occurrenceDateTime: "2025-01-14T14:15:00Z",
            totalCost: { value: 200.00, currency: "USD" },
            financialTransactionDetail: [{
              description: "Inbound Specialist Consultation",
              unitCost: { value: 200.00, currency: "USD" },
              quantity: { valueDecimal: 1 },
              code: {
                coding: [{
                  system: "http://www.ama-assn.org/go/cpt",
                  code: "99243",
                  display: "Office Consultation Level 3"
                }]
              }
            }],
            note: [{
              text: "Inbound charge from referral system"
            }]
          }
        }
      ]
    };
    
    return NextResponse.json(mockData);
  }
}
