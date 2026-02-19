#!/usr/bin/env node

/**
 * Ollama Intelligence MCP - Arbeidsmarkt & Concurrentie Analyse
 *
 * Vacature Analyse V2: Gebaseerd op intelligent-document-processor.ts patterns
 * - Auto-detectie document type (APK, vacature, general)
 * - SEO scoring + employer branding evaluatie
 * - Verbeterde vacaturetekst generatie
 * - Kandidaat pool schatting + time-to-fill
 *
 * Tools:
 * - intel_target_audience: Doelgroep profiel genereren
 * - intel_competitor_analysis: Concurrentie analyse (recruitment bureaus)
 * - intel_vacancy_analysis_v2: Vacature tekst analyseren (uitgebreid, v2)
 * - intel_vacancy_improve: Verbeterde vacaturetekst genereren
 * - intel_market_trends: Arbeidsmarkt trends en schaarste analyse
 * - intel_salary_benchmark: Salaris benchmark voor functie/sector
 * - intel_sector_report: Sector-specifiek arbeidsmarkt rapport
 * - intel_candidate_persona: Ideaal kandidaat persona genereren
 * - intel_hiring_difficulty: Wervingsmoeilijkheid score per functie
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const DEFAULT_MODEL = process.env.OLLAMA_DEFAULT_MODEL || "llama3.2";

const SYSTEM_BASE = `Je bent een arbeidsmarkt intelligence expert voor de Nederlandse technische recruitment sector.
Focus: Engineering, Automation, Manufacturing, IT in regio Arnhem/Gelderland en heel Nederland.
Data-driven analyse, concrete cijfers waar mogelijk, altijd in het Nederlands.`;

const VACATURE_V2_SYSTEM = `Je bent een vacature-analyse expert (V2) voor de Nederlandse technische recruitment markt.
Je analyseert vacatureteksten op 6 dimensies:
1. Inhoud & Compleetheid (zijn alle essentiële onderdelen aanwezig?)
2. SEO & Vindbaarheid (keywords, structuur, online zichtbaarheid)
3. Employer Branding (bedrijfscultuur, EVP, aantrekkelijkheid)
4. Kandidaat Aantrekkelijkheid (wordt de juiste doelgroep aangesproken?)
5. Marktcompetitiviteit (hoe verhoudt deze vacature zich tot concurrenten?)
6. Conversie Potentieel (duidelijke CTA, laagdrempelig solliciteren?)

Je geeft concrete, actionable feedback per dimensie. Altijd in het Nederlands.`;

async function ollamaGenerate(model, prompt, system) {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, system: system || SYSTEM_BASE, stream: false }),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}: ${await res.text()}`);
  return (await res.json()).response;
}

const server = new Server(
  { name: "ollama-intelligence-mcp", version: "2.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "intel_target_audience",
      description: "Genereer een gedetailleerd doelgroep profiel voor recruitment campagnes. Inclusief demografie, kanalen, messaging.",
      inputSchema: {
        type: "object",
        properties: {
          function_title: { type: "string", description: "Functie (bijv. 'PLC Programmeur', 'Mechanical Engineer')" },
          sector: { type: "string", description: "Sector (bijv. 'Food & Beverage', 'Automotive')" },
          region: { type: "string", description: "Regio (default: Gelderland)" },
          seniority: { type: "string", enum: ["junior", "medior", "senior", "lead"], description: "Ervaringsniveau" },
        },
        required: ["function_title"],
      },
    },
    {
      name: "intel_competitor_analysis",
      description: "Analyseer een concurrerend recruitment bureau: sterke/zwakke punten, pricing, positionering.",
      inputSchema: {
        type: "object",
        properties: {
          competitor_name: { type: "string", description: "Naam concurrent" },
          competitor_info: { type: "string", description: "Beschikbare info (website, LinkedIn, vacatures)" },
          focus_area: { type: "string", description: "Vergelijkingsgebied (bijv. 'technisch recruitment', 'IT detachering')" },
        },
        required: ["competitor_name"],
      },
    },
    {
      name: "intel_vacancy_analysis_v2",
      description: "Vacature Analyse V2: Uitgebreide analyse op 6 dimensies (inhoud, SEO, branding, aantrekkelijkheid, competitiviteit, conversie). Gebaseerd op Recruitin vacature-analyse ontwerp.",
      inputSchema: {
        type: "object",
        properties: {
          vacancy_text: { type: "string", description: "Volledige vacaturetekst" },
          company_name: { type: "string", description: "Bedrijfsnaam" },
          sector: { type: "string", description: "Sector (bijv. 'IT', 'engineering', 'manufacturing')" },
          region: { type: "string", description: "Regio voor marktcontext" },
        },
        required: ["vacancy_text"],
      },
    },
    {
      name: "intel_vacancy_improve",
      description: "Genereer een verbeterde vacaturetekst op basis van analyse. SEO-geoptimaliseerd, aantrekkelijker employer branding, betere conversie.",
      inputSchema: {
        type: "object",
        properties: {
          vacancy_text: { type: "string", description: "Originele vacaturetekst" },
          company_name: { type: "string", description: "Bedrijfsnaam" },
          company_culture: { type: "string", description: "Bedrijfscultuur info (optioneel)" },
          target_audience: { type: "string", description: "Doelgroep (bijv. 'senior developers', 'werktuigbouwkundigen')" },
          improvements_focus: { type: "string", description: "Focus verbeteringen: 'seo', 'branding', 'conversie', 'alles' (default: alles)" },
        },
        required: ["vacancy_text"],
      },
    },
    {
      name: "intel_market_trends",
      description: "Analyseer arbeidsmarkt trends voor een specifieke functie of sector. Schaarste, groei, technologie shifts.",
      inputSchema: {
        type: "object",
        properties: {
          topic: { type: "string", description: "Functie, sector of technologie om te analyseren" },
          timeframe: { type: "string", enum: ["kort", "middel", "lang"], description: "Termijn: kort (3m), middel (1j), lang (3j)" },
        },
        required: ["topic"],
      },
    },
    {
      name: "intel_salary_benchmark",
      description: "Salaris benchmark voor een functie inclusief factoren, spreiding en onderhandelingsruimte.",
      inputSchema: {
        type: "object",
        properties: {
          function_title: { type: "string", description: "Functie" },
          experience_years: { type: "number", description: "Jaren ervaring" },
          region: { type: "string", description: "Regio (default: Nederland)" },
          sector: { type: "string", description: "Sector" },
        },
        required: ["function_title"],
      },
    },
    {
      name: "intel_sector_report",
      description: "Genereer een sector arbeidsmarkt rapport met schaarste, trends, top werkgevers en kansen.",
      inputSchema: {
        type: "object",
        properties: {
          sector: { type: "string", description: "Sector (bijv. 'semiconductor', 'food processing', 'logistics')" },
          region: { type: "string", description: "Regio (default: Nederland)" },
        },
        required: ["sector"],
      },
    },
    {
      name: "intel_candidate_persona",
      description: "Genereer een ideaal kandidaat persona voor een vacature. Demografie, motivatie, kanalen, messaging.",
      inputSchema: {
        type: "object",
        properties: {
          vacancy_title: { type: "string", description: "Vacaturetitel" },
          company_type: { type: "string", description: "Type bedrijf (bijv. 'scale-up', 'multinational', 'familiebedrijf')" },
          must_haves: { type: "string", description: "Harde eisen (komma-gescheiden)" },
        },
        required: ["vacancy_title"],
      },
    },
    {
      name: "intel_hiring_difficulty",
      description: "Bereken wervingsmoeilijkheid score (0-100) voor een functie met onderbouwing en aanbevelingen.",
      inputSchema: {
        type: "object",
        properties: {
          function_title: { type: "string", description: "Functie" },
          sector: { type: "string", description: "Sector" },
          region: { type: "string", description: "Regio" },
          salary_range: { type: "string", description: "Salarisrange (bijv. '50k-65k')" },
        },
        required: ["function_title"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  const model = args.model || DEFAULT_MODEL;

  try {
    let response;

    switch (name) {
      case "intel_target_audience": {
        response = await ollamaGenerate(model,
          `Genereer een doelgroep profiel voor recruitment:

FUNCTIE: ${args.function_title}
SECTOR: ${args.sector || "technisch/engineering"}
REGIO: ${args.region || "Gelderland/Nederland"}
NIVEAU: ${args.seniority || "medior"}

Retourneer JSON: {
  "persona_name": "typische naam",
  "demographics": { "age_range": "...", "education": "...", "experience_years": "..." },
  "current_situation": "waar werkt deze persoon nu",
  "motivations": ["wat motiveert een switch"],
  "frustrations": ["wat frustreert in huidige baan"],
  "channels": { "primary": [...], "secondary": [...] },
  "messaging_hooks": ["3-5 messaging angles die aanspreken"],
  "salary_expectation": "range",
  "availability": "actief/latent/passief zoekend",
  "best_approach": "hoe benader je deze persoon"
}`,
          SYSTEM_BASE + "\nRetourneer alleen valid JSON."
        );
        break;
      }

      case "intel_competitor_analysis": {
        response = await ollamaGenerate(model,
          `Analyseer deze concurrent van Recruitin:

CONCURRENT: ${args.competitor_name}
INFO: ${args.competitor_info || "geen specifieke info beschikbaar"}
FOCUS: ${args.focus_area || "technisch recruitment"}

Retourneer JSON: {
  "strengths": [...],
  "weaknesses": [...],
  "market_position": "...",
  "pricing_model": "...",
  "target_segments": [...],
  "differentiators": [...],
  "threat_level": "hoog/midden/laag",
  "opportunities_vs": ["kansen voor Recruitin t.o.v. deze concurrent"],
  "recommended_response": "..."
}`,
          SYSTEM_BASE + "\nRetourneer alleen valid JSON."
        );
        break;
      }

      case "intel_vacancy_analysis_v2": {
        // Vacature Analyse V2 - gebaseerd op intelligent-document-processor.ts patronen
        response = await ollamaGenerate(model,
          `VACATURE ANALYSE V2 - Uitgebreide 6-dimensie analyse

BEDRIJF: ${args.company_name || "onbekend"}
SECTOR: ${args.sector || "technisch"}
REGIO: ${args.region || "Nederland"}

VACATURETEKST:
${args.vacancy_text}

Analyseer deze vacature op 6 dimensies en geef per dimensie een score (1-10) + feedback.

Retourneer JSON: {
  "function_title": "gedetecteerde functietitel",
  "document_type": "vacature_analyse",
  "overall_score": 1-10,
  "dimensions": {
    "inhoud_compleetheid": {
      "score": 1-10,
      "aanwezig": ["welke onderdelen zijn aanwezig"],
      "ontbreekt": ["welke essentiële onderdelen missen"],
      "feedback": "concrete feedback"
    },
    "seo_vindbaarheid": {
      "score": 1-10,
      "keywords_gevonden": ["relevante keywords in de tekst"],
      "keywords_ontbreken": ["keywords die toegevoegd moeten worden"],
      "structuur_score": 1-10,
      "feedback": "concrete SEO verbeterpunten"
    },
    "employer_branding": {
      "score": 1-10,
      "cultuur_zichtbaar": true/false,
      "evp_duidelijk": true/false,
      "onderscheidend": true/false,
      "feedback": "hoe employer branding verbeteren"
    },
    "kandidaat_aantrekkelijkheid": {
      "score": 1-10,
      "doelgroep_match": "hoog/midden/laag",
      "tone_of_voice": "formeel/informeel/tech/corporate",
      "inclusiviteit": 1-10,
      "feedback": "hoe aantrekkelijker maken voor doelgroep"
    },
    "markt_competitiviteit": {
      "score": 1-10,
      "salaris_competitief": "boven/gemiddeld/onder markt",
      "voorwaarden_score": 1-10,
      "unique_selling_points": [...],
      "feedback": "hoe competitiever positioneren"
    },
    "conversie_potentieel": {
      "score": 1-10,
      "cta_aanwezig": true/false,
      "sollicitatie_drempel": "laag/midden/hoog",
      "mobiel_vriendelijk": "ja/nee/onbekend",
      "feedback": "hoe conversie verhogen"
    }
  },
  "salary_estimate": { "min": number, "max": number, "confidence": "hoog/midden/laag" },
  "requirements_priority": {
    "must_have": ["echte harde eisen"],
    "nice_to_have": ["wensen vermomd als eisen"],
    "unrealistic": ["onrealistische combinatie-eisen"]
  },
  "candidate_pool_estimate": "groot/midden/klein",
  "hiring_difficulty": 0-100,
  "time_to_fill_estimate": "X weken",
  "top_3_verbeterpunten": ["de 3 belangrijkste verbeteringen"],
  "verwachte_verbetering": "X% meer gekwalificeerde sollicitaties na verbeteringen"
}`,
          VACATURE_V2_SYSTEM + "\nRetourneer alleen valid JSON."
        );
        break;
      }

      case "intel_vacancy_improve": {
        // Verbeterde vacaturetekst generatie - gebaseerd op v1 generateVacatureAnalyse()
        const focus = args.improvements_focus || "alles";
        const focusInstructions = {
          seo: "Focus op SEO optimalisatie: keywords, meta-beschrijving, gestructureerde headings, zoekterm-vriendelijke titels.",
          branding: "Focus op employer branding: bedrijfscultuur, EVP (Employee Value Proposition), onderscheidende voordelen, authentieke tone.",
          conversie: "Focus op conversie: duidelijke CTA, laagdrempelig solliciteren, mobile-friendly structuur, urgentie.",
          alles: "Optimaliseer alle aspecten: SEO, employer branding, kandidaat aantrekkelijkheid en conversie."
        };

        response = await ollamaGenerate(model,
          `VERBETERDE VACATURETEKST GENEREREN

ORIGINELE VACATURE:
${args.vacancy_text}

BEDRIJF: ${args.company_name || "het bedrijf"}
BEDRIJFSCULTUUR: ${args.company_culture || "niet opgegeven - gebruik generieke maar authentieke cultuuromschrijving"}
DOELGROEP: ${args.target_audience || "technische professionals"}

OPTIMALISATIE FOCUS: ${focusInstructions[focus] || focusInstructions.alles}

Genereer een VOLLEDIG VERBETERDE vacaturetekst die:

1. INHOUD - Alle essentiële secties bevat:
   - Pakkende titel (SEO-geoptimaliseerd)
   - Korte intro (max 3 zinnen, direct aansprekend)
   - Over het bedrijf (cultuur, missie, waarom hier werken)
   - Wat ga je doen (concrete taken, impact)
   - Wat breng je mee (realistisch, must-have vs nice-to-have gescheiden)
   - Wat bieden wij (concreet, geen vage beloftes)
   - Sollicitatieprocedure (laagdrempelig, transparant)

2. SEO - Geoptimaliseerd voor:
   - Relevante zoektermen in titel en eerste alinea
   - Gestructureerde headings (H2, H3)
   - Functietitel variaties
   - Locatie mentions

3. BRANDING - Authentiek en onderscheidend:
   - Bedrijfscultuur concreet zichtbaar
   - Employee Value Proposition helder
   - Social proof (awards, certificeringen, groeicijfers)

4. CONVERSIE - Laagdrempelig:
   - Duidelijke call-to-action
   - Geen onnodige drempels
   - Contact persoon met naam
   - Verwachte reactietermijn

Retourneer de VOLLEDIGE verbeterde vacaturetekst, klaar om te publiceren.
Voeg na de vacaturetekst een sectie "---ANALYSE---" toe met:
- Belangrijkste wijzigingen t.o.v. origineel
- Verwachte impact op sollicitatie-aantallen
- Extra aanbevelingen`,
          VACATURE_V2_SYSTEM
        );
        break;
      }

      case "intel_market_trends": {
        const termijnMap = { kort: "3 maanden", middel: "1 jaar", lang: "3 jaar" };
        response = await ollamaGenerate(model,
          `Analyseer arbeidsmarkt trends voor: ${args.topic}
Termijn: ${termijnMap[args.timeframe] || "1 jaar"}

Retourneer JSON: {
  "summary": "2-3 zinnen overzicht",
  "demand_trend": "stijgend/stabiel/dalend",
  "supply_trend": "stijgend/stabiel/dalend",
  "scarcity_level": "kritiek/hoog/midden/laag",
  "key_trends": [...],
  "technology_shifts": [...],
  "salary_trend": "stijgend/stabiel/dalend",
  "regional_hotspots": [...],
  "opportunities": ["kansen voor Recruitin"],
  "risks": ["risico's"]
}`,
          SYSTEM_BASE + "\nRetourneer alleen valid JSON."
        );
        break;
      }

      case "intel_salary_benchmark": {
        response = await ollamaGenerate(model,
          `Salaris benchmark:

FUNCTIE: ${args.function_title}
ERVARING: ${args.experience_years || "niet gespecificeerd"} jaar
REGIO: ${args.region || "Nederland"}
SECTOR: ${args.sector || "technisch"}

Retourneer JSON: {
  "salary_range": { "min": number, "median": number, "max": number },
  "factors": ["factoren die salaris beïnvloeden"],
  "bonus_typical": "...",
  "secondary_benefits": [...],
  "negotiation_room": "percentage",
  "market_pressure": "hoog/midden/laag",
  "trend": "stijgend/stabiel/dalend",
  "note": "disclaimer over schattingen"
}`,
          SYSTEM_BASE + "\nRetourneer alleen valid JSON."
        );
        break;
      }

      case "intel_sector_report": {
        response = await ollamaGenerate(model,
          `Genereer een arbeidsmarkt sector rapport:

SECTOR: ${args.sector}
REGIO: ${args.region || "Nederland"}

Inhoud:
1. Sector overview (grootte, groei)
2. Arbeidsmarkt situatie (schaarste, trends)
3. Top 10 functies met hoogste vraag
4. Salaris ranges voor key functies
5. Top werkgevers in de sector
6. Technologie trends
7. Kansen voor recruitment

Format als gestructureerd rapport met headers.`,
          SYSTEM_BASE
        );
        break;
      }

      case "intel_candidate_persona": {
        response = await ollamaGenerate(model,
          `Genereer een ideaal kandidaat persona:

VACATURE: ${args.vacancy_title}
BEDRIJFSTYPE: ${args.company_type || "technisch bedrijf"}
HARDE EISEN: ${args.must_haves || "niet gespecificeerd"}

Retourneer JSON: {
  "persona_name": "fictieve naam",
  "age": number,
  "education": "...",
  "current_role": "...",
  "current_employer_type": "...",
  "experience_years": number,
  "key_skills": [...],
  "motivation_to_switch": [...],
  "deal_breakers": [...],
  "preferred_channels": [...],
  "best_time_to_reach": "...",
  "interview_tips": [...],
  "pitch": "ideale 2-zin pitch voor deze kandidaat"
}`,
          SYSTEM_BASE + "\nRetourneer alleen valid JSON."
        );
        break;
      }

      case "intel_hiring_difficulty": {
        response = await ollamaGenerate(model,
          `Bereken wervingsmoeilijkheid:

FUNCTIE: ${args.function_title}
SECTOR: ${args.sector || "technisch"}
REGIO: ${args.region || "Nederland"}
SALARIS: ${args.salary_range || "marktconform"}

Retourneer JSON: {
  "difficulty_score": 0-100,
  "difficulty_label": "makkelijk/gemiddeld/moeilijk/zeer moeilijk/bijna onmogelijk",
  "factors": { "supply": "...", "demand": "...", "competition": "...", "salary_competitiveness": "..." },
  "estimated_time_to_fill": "X weken",
  "estimated_cost_per_hire": "...",
  "recommended_channels": [...],
  "alternative_profiles": ["alternatieve profielen om te overwegen"],
  "tips": ["concrete tips om deze vacature sneller te vullen"]
}`,
          SYSTEM_BASE + "\nRetourneer alleen valid JSON."
        );
        break;
      }

      default:
        return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
    }

    return { content: [{ type: "text", text: response }] };
  } catch (error) {
    const hint = error.message.includes("ECONNREFUSED") ? "\n\nIs Ollama running? Start: ollama serve" : "";
    return { content: [{ type: "text", text: `Error: ${error.message}${hint}` }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Ollama Intelligence MCP v2 running (${OLLAMA_BASE_URL}, model: ${DEFAULT_MODEL})`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
