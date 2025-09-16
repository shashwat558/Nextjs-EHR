import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, {params}: {params: Promise<{id: string}>}) {
    const {id} = await params;

    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token")?.value;
    
    try {
        const res = await fetch(`${process.env.BASE_URL}/apiportal/ema/fhir/v2/AllergyIntolerance/${id}`, {
            headers: {
                accept: "application/fhir+json",
                authorization: `Bearer ${access_token}`,
                'x-api-key': `${process.env.API_KEY}`
            },
        });

        if (!res.ok) {
            throw new Error(`API request failed with status: ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({message: "Error getting allergy"}, {status: 500});
    }
}

export async function PUT(req: NextRequest, {params}: {params: Promise<{id: string}>}) {
    const {id} = await params;

    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token");

    if (!access_token) {
        return NextResponse.json({ error: "No access token found" }, { status: 401 });
    }

    try {
        const {
            clinicalStatus,
            code,
            patient,
            onset,
            recordedDate,
            reaction
        } = await req.json();

        
        const mapSeverity = (emaSeverity: string) => {
            const severityMap: Record<string, string> = {
                'unspecified': '', 
                'mild': 'mild',
                'mild to moderate': 'mild',
                'moderate': 'moderate',
                'moderate to severe': 'moderate',
                'severe': 'severe',
                'fatal': 'severe'
            };
            return severityMap[emaSeverity] || '';
        };

        
        const mapManifestation = (manifestation: string) => {
            const manifestationMap: Record<string, {code: string, display: string}> = {
                'Anaphylaxis': {code: '417516000', display: 'Anaphylaxis'},
                'Angioedema': {code: '41291007', display: 'Angioedema'},
                'Diarrhea': {code: '62315008', display: 'Diarrhea'},
                'Dizziness': {code: '404640003', display: 'Dizziness'},
                'Fatigue': {code: '84229001', display: 'Fatigue'},
                'GI upset': {code: '162059005', display: 'GI upset'},
                'Hives': {code: '126485001', display: 'Hives'},
                'Liver toxicity': {code: '197354009', display: 'Liver toxicity'},
                'Nausea': {code: '422587007', display: 'Nausea'},
                'Rash': {code: '162415008', display: 'Rash'},
                'Shortness of breath': {code: '267036007', display: 'Shortness of breath'},
                'Swelling': {code: '65124004', display: 'Swelling'},
                'Weal': {code: '247472004', display: 'Weal'},
                'Other': {code: '419199007', display: 'Other'}
            };
            return manifestationMap[manifestation] || {code: '419199007', display: 'Other'};
        };

        
        let processedReaction = reaction;
        if (reaction && Array.isArray(reaction)) {
            processedReaction = reaction.map((r: Record<string, unknown>) => {
                const processedR = { ...r };
                
                
                if (r.severity && typeof r.severity === 'string') {
                    const mappedSeverity = mapSeverity(r.severity);
                    if (mappedSeverity) {
                        processedR.severity = mappedSeverity;
                    } else {
                        delete processedR.severity; 
                    }
                }

                
                if (r.manifestation && typeof r.manifestation === 'string') {
                    const mappedManifestation = mapManifestation(r.manifestation);
                    processedR.manifestation = [{
                        coding: [{
                            system: "http://snomed.info/sct",
                            code: mappedManifestation.code,
                            display: mappedManifestation.display
                        }]
                    }];
                }

                return processedR;
            });
        }

        
        const allergyIntoleranceResource = {
            resourceType: "AllergyIntolerance",
            id,
            ...(clinicalStatus && { clinicalStatus }),
            ...(code && { code }),
            ...(patient && { patient }),
            ...(onset && { onset }),
            ...(recordedDate && { recordedDate }),
            ...(processedReaction && { reaction: processedReaction })
        };

        const res = await fetch(`${process.env.BASE_URL}/apiportal/ema/fhir/v2/AllergyIntolerance/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/fhir+json",
                "accept": "application/fhir+json",
                "authorization": `Bearer ${access_token.value}`,
                "x-api-key": `${process.env.API_KEY}`
            },
            body: JSON.stringify(allergyIntoleranceResource)
        });

        if (!res.ok) {
            throw new Error(`API request failed with status: ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json({
            ...data,
            message: "AllergyIntolerance updated successfully. Note: Changes require reconciliation by the Practice before being added to the Patient's chart."
        });
    } catch (error) {
        console.error("Error updating allergy:", error);
        return NextResponse.json({
            message: "Error updating allergy", 
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}

    

