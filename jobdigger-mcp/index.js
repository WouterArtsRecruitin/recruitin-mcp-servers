#!/usr/bin/env node

/**
 * JobDigger MCP - Automation Flows V1, V2, V3
 *
 * Gebaseerd op: jobdigger-automation-integration.md + jobdigger-integrator.ts
 *
 * V1 - Lead Scoring & Enrichment:
 * - jobdigger_score_lead: Score een JobDigger lead (0-100) op basis van sector fit, company size, hiring signals
 * - jobdigger_enrich_company: Verrijk bedrijfsinformatie (sector, grootte, tech stack, contact)
 * - jobdigger_batch_prioritize: Prioriteer een batch JobDigger leads
 *
 * V2 - Profile Analysis & Matching:
 * - jobdigger_analyze_profile: Analyseer een kandidaat profiel (LinkedIn/CV)
 * - jobdigger_match_vacancy: Match kandidaat aan vacature met score
 * - jobdigger_boolean_search: Genereer boolean search strings voor LinkedIn Recruiter
 *
 * V3 - Complete Email Sequence Automation:
 * - jobdigger_generate_sequence: Genereer 6-email tech-focused outreach sequence
 * - jobdigger_personalize_email: Personaliseer een email template met deal context
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const DEFAULT_MODEL = process.env.OLLAMA_DEFAULT_MODEL || "llama3.2";

const SYSTEM_BASE = `Je bent een JobDigger automation expert voor Recruitin, een technisch recruitment bureau in Arnhem.
Focus: Technische vacatures - Engineering, Automation, Manufacturing, IT, Development.
Context: JobDigger is een platform dat vacatures uit heel Nederland aggregeert.
Recruitin gebruikt JobDigger om:
1. Bedrijven te identificeren die technisch personeel zoeken (leads)
2. Kandidaten te matchen aan vacatures
3. Gepersonaliseerde outreach te doen

Tech sector realiteit:
- 65% meer vraag dan aanbod voor developers
- Gemiddelde time-to-hire: 12+ weken
- 40% hogere salary inflatie in tech vs andere sectoren
- Remote work verwachtingen zijn standaard

Altijd in het Nederlands tenzij anders gevraagd.`;

const SEQUENCE_SYSTEM = `${SYSTEM_BASE}

Email sequence regels (Wouter's stijl):
- Direct, eerlijk, geen corporate bullshit
- Max 150 woorden per email
- Persoonlijk en relevant
- Concrete waarde bieden
- Elke email andere invalshoek
- Laatste email = break-up email
- Clean formatting (geen markdown bold in emails)
- Ondertekend door Wouter Arts, Recruitin`;

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
  { name: "jobdigger-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // === V1: Lead Scoring & Enrichment ===
    {
      name: "jobdigger_score_lead",
      description: "V1: Score een JobDigger lead (0-100). Analyseert sector fit, bedrijfsgrootte, hiring signals, locatie en urgentie.",
      inputSchema: {
        type: "object",
        properties: {
          company_name: { type: "string", description: "Bedrijfsnaam" },
          vacancy_title: { type: "string", description: "Vacaturetitel uit JobDigger" },
          location: { type: "string", description: "Locatie" },
          sector: { type: "string", description: "Sector/branche" },
          company_info: { type: "string", description: "Extra bedrijfsinfo (website tekst, LinkedIn, etc.)" },
          num_vacancies: { type: "number", description: "Aantal open vacatures bij dit bedrijf" },
        },
        required: ["company_name", "vacancy_title"],
      },
    },
    {
      name: "jobdigger_enrich_company",
      description: "V1: Verrijk bedrijfsinformatie voor een JobDigger lead. Schat sector, grootte, tech stack en contactstrategie in.",
      inputSchema: {
        type: "object",
        properties: {
          company_name: { type: "string", description: "Bedrijfsnaam" },
          company_website: { type: "string", description: "Website URL" },
          known_info: { type: "string", description: "Bekende informatie over het bedrijf" },
          vacancy_titles: { type: "string", description: "Gevonden vacaturetitels (komma-gescheiden)" },
        },
        required: ["company_name"],
      },
    },
    {
      name: "jobdigger_batch_prioritize",
      description: "V1: Prioriteer een batch JobDigger leads. Geeft top-10 met score en aanbevolen aanpak per lead.",
      inputSchema: {
        type: "object",
        properties: {
          leads: { type: "string", description: "Lijst leads in format: 'Bedrijf1 - Vacature1 - Locatie1; Bedrijf2 - Vacature2 - Locatie2; ...'" },
          filter_sector: { type: "string", description: "Filter op sector (optioneel)" },
          filter_region: { type: "string", description: "Filter op regio (optioneel)" },
        },
        required: ["leads"],
      },
    },

    // === V2: Profile Analysis & Matching ===
    {
      name: "jobdigger_analyze_profile",
      description: "V2: Analyseer een kandidaat profiel (LinkedIn/CV). Extraheer skills, ervaring, fit-score voor technische rollen.",
      inputSchema: {
        type: "object",
        properties: {
          profile_text: { type: "string", description: "Profiel tekst (LinkedIn samenvatting, CV tekst, etc.)" },
          target_role: { type: "string", description: "Gewenste functie/rol om op te matchen" },
        },
        required: ["profile_text"],
      },
    },
    {
      name: "jobdigger_match_vacancy",
      description: "V2: Match een kandidaat profiel aan een vacature. Geeft match-score (0-100), sterke punten, gaps en aanbeveling.",
      inputSchema: {
        type: "object",
        properties: {
          candidate_profile: { type: "string", description: "Kandidaat profiel/CV tekst" },
          vacancy_text: { type: "string", description: "Vacaturetekst" },
          company_name: { type: "string", description: "Bedrijfsnaam (voor context)" },
        },
        required: ["candidate_profile", "vacancy_text"],
      },
    },
    {
      name: "jobdigger_boolean_search",
      description: "V2: Genereer boolean search strings voor LinkedIn Recruiter. Inclusief variaties en uitleg.",
      inputSchema: {
        type: "object",
        properties: {
          function_title: { type: "string", description: "Gezochte functie" },
          must_have_skills: { type: "string", description: "Verplichte skills (komma-gescheiden)" },
          nice_to_have_skills: { type: "string", description: "Nice-to-have skills (komma-gescheiden)" },
          exclude: { type: "string", description: "Uit te sluiten termen (komma-gescheiden)" },
          location: { type: "string", description: "Locatie/regio" },
        },
        required: ["function_title"],
      },
    },

    // === V3: Complete Email Sequence Automation ===
    {
      name: "jobdigger_generate_sequence",
      description: "V3: Genereer een complete 6-email tech-focused outreach sequence. Gebaseerd op JobDigger vacancy data. Elke email andere invalshoek.",
      inputSchema: {
        type: "object",
        properties: {
          company_name: { type: "string", description: "Bedrijfsnaam" },
          contact_name: { type: "string", description: "Naam contactpersoon" },
          contact_role: { type: "string", description: "Functie contactpersoon (bijv. 'CTO', 'HR Manager')" },
          vacancy_title: { type: "string", description: "Vacaturetitel uit JobDigger" },
          tech_stack: { type: "string", description: "Tech stack (bijv. 'React, Python, AWS')" },
          company_size: { type: "string", enum: ["startup", "scale-up", "mkb", "enterprise"], description: "Bedrijfsgrootte" },
          urgency: { type: "string", enum: ["low", "medium", "high"], description: "Urgentie niveau" },
        },
        required: ["company_name", "contact_name", "vacancy_title"],
      },
    },
    {
      name: "jobdigger_personalize_email",
      description: "V3: Personaliseer een specifieke email uit de sequence met extra context (nieuws, mutual connections, etc.).",
      inputSchema: {
        type: "object",
        properties: {
          email_template: { type: "string", description: "Basis email tekst om te personaliseren" },
          company_name: { type: "string", description: "Bedrijfsnaam" },
          contact_name: { type: "string", description: "Naam contactpersoon" },
          personalization_context: { type: "string", description: "Extra context (recent nieuws, mutual connections, gedeelde interesses)" },
          approach: { type: "string", enum: ["tech_shortage", "talent_pipeline", "team_scaling", "innovation", "partnership", "break_up"], description: "Email invalshoek" },
        },
        required: ["email_template", "company_name", "contact_name"],
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
      // === V1: Lead Scoring & Enrichment ===

      case "jobdigger_score_lead": {
        response = await ollamaGenerate(model,
          `Score deze JobDigger lead voor Recruitin:

BEDRIJF: ${args.company_name}
VACATURE: ${args.vacancy_title}
LOCATIE: ${args.location || "onbekend"}
SECTOR: ${args.sector || "onbekend"}
EXTRA INFO: ${args.company_info || "geen"}
AANTAL VACATURES: ${args.num_vacancies || "1"}

Beoordeel op:
1. Sector fit (technisch/engineering = hoog, administratief = laag)
2. Bedrijfsgrootte schatting (>50 medewerkers = interessanter)
3. Hiring signals (meerdere vacatures = urgent)
4. Regio (Gelderland/Randstad = bonus)
5. Potentieel herhaaldelijk business (vs eenmalig)
6. Bereikbaarheid decision maker

Retourneer JSON: {
  "lead_score": 0-100,
  "sector_fit": { "score": 1-10, "reason": "..." },
  "company_size_estimate": "startup/mkb/enterprise",
  "hiring_urgency": "laag/midden/hoog",
  "potential_value": "laag/midden/hoog/zeer hoog",
  "recommended_approach": "cold_email/linkedin/telefoon/netwerk",
  "ideal_contact_role": "CTO/HR Manager/Hiring Manager/etc.",
  "talking_points": ["3 gespreksopeners voor dit bedrijf"],
  "risk_factors": ["potentiële bezwaren of risico's"],
  "priority": "A (direct benaderen) / B (deze week) / C (later) / D (skip)"
}`,
          SYSTEM_BASE + "\nRetourneer alleen valid JSON."
        );
        break;
      }

      case "jobdigger_enrich_company": {
        response = await ollamaGenerate(model,
          `Verrijk deze bedrijfsinformatie:

BEDRIJF: ${args.company_name}
WEBSITE: ${args.company_website || "onbekend"}
BEKENDE INFO: ${args.known_info || "geen"}
VACATURES: ${args.vacancy_titles || "onbekend"}

Schat in en retourneer JSON: {
  "company_name": "${args.company_name}",
  "estimated_sector": "primaire sector",
  "sub_sectors": ["relevante sub-sectoren"],
  "estimated_size": "1-10/10-50/50-200/200-500/500+",
  "estimated_revenue": "range schatting",
  "tech_stack_guess": ["geschatte technologieën op basis van vacatures"],
  "decision_makers": {
    "primary": { "role": "meest waarschijnlijke beslisser", "approach": "hoe benaderen" },
    "secondary": { "role": "alternatief contact", "approach": "hoe benaderen" }
  },
  "company_culture_signals": ["cultuur indicatoren uit vacatures/website"],
  "growth_signals": ["groei indicatoren"],
  "recruitment_pain_points": ["verwachte recruitment uitdagingen"],
  "recruitin_value_prop": "waarom Recruitin waardevol is voor dit bedrijf",
  "kvk_search_tip": "zoekterm voor KvK lookup"
}`,
          SYSTEM_BASE + "\nRetourneer alleen valid JSON."
        );
        break;
      }

      case "jobdigger_batch_prioritize": {
        response = await ollamaGenerate(model,
          `Prioriteer deze batch JobDigger leads voor Recruitin:

LEADS:
${args.leads}

${args.filter_sector ? `FILTER SECTOR: ${args.filter_sector}` : ""}
${args.filter_region ? `FILTER REGIO: ${args.filter_region}` : ""}

Analyseer alle leads en retourneer JSON: {
  "total_leads": number,
  "filtered_leads": number,
  "top_10": [
    {
      "rank": 1,
      "company": "bedrijfsnaam",
      "vacancy": "vacaturetitel",
      "score": 0-100,
      "priority": "A/B/C",
      "reason": "waarom hoog gerankt",
      "recommended_action": "eerste stap"
    }
  ],
  "skip_list": ["bedrijven om over te slaan + reden"],
  "sector_breakdown": { "technisch": X, "IT": X, "overig": X },
  "batch_strategy": "aanbevolen benadering voor deze batch"
}`,
          SYSTEM_BASE + "\nRetourneer alleen valid JSON."
        );
        break;
      }

      // === V2: Profile Analysis & Matching ===

      case "jobdigger_analyze_profile": {
        response = await ollamaGenerate(model,
          `Analyseer dit kandidaat profiel:

${args.profile_text}

${args.target_role ? `GEWENSTE ROL: ${args.target_role}` : ""}

Retourneer JSON: {
  "name": "naam (als gevonden)",
  "current_role": "huidige functie",
  "experience_years": number,
  "seniority": "junior/medior/senior/lead/management",
  "key_skills": {
    "technical": ["technische skills"],
    "soft": ["soft skills"],
    "tools": ["tools en frameworks"]
  },
  "education": "hoogste opleiding",
  "languages": ["talen"],
  "certifications": ["certificeringen"],
  "industry_experience": ["sectoren waar ervaring mee"],
  "strengths": ["top 3 sterke punten"],
  "development_areas": ["verbeterpunten"],
  "ideal_next_role": "geschatte ideale volgende stap",
  "market_value": "hoog/midden/laag (voor huidige markt)",
  "availability_guess": "actief/latent/passief zoekend",
  "approach_suggestion": "hoe deze kandidaat benaderen"
}`,
          SYSTEM_BASE + "\nRetourneer alleen valid JSON."
        );
        break;
      }

      case "jobdigger_match_vacancy": {
        response = await ollamaGenerate(model,
          `Match deze kandidaat aan deze vacature:

KANDIDAAT PROFIEL:
${args.candidate_profile}

VACATURE:
${args.vacancy_text}

${args.company_name ? `BEDRIJF: ${args.company_name}` : ""}

Retourneer JSON: {
  "match_score": 0-100,
  "match_label": "strong match/potential match/weak match/no match",
  "skill_match": {
    "matched": ["skills die matchen"],
    "missing_critical": ["ontbrekende harde eisen"],
    "missing_nice_to_have": ["ontbrekende nice-to-haves"],
    "bonus_skills": ["extra skills die niet gevraagd maar waardevol zijn"]
  },
  "experience_match": {
    "years_required": "uit vacature",
    "years_available": "van kandidaat",
    "gap": "te weinig/passend/meer dan gevraagd"
  },
  "culture_fit_signals": ["cultuur fit indicatoren"],
  "salary_expectation_match": "waarschijnlijk passend/onderhandeling nodig/gap te groot",
  "recommendation": "concrete aanbeveling",
  "pitch_to_candidate": "2-3 zinnen waarom deze vacature interessant is voor de kandidaat",
  "pitch_to_client": "2-3 zinnen waarom deze kandidaat interessant is voor het bedrijf",
  "risk_factors": ["mogelijke bezwaren van beide kanten"],
  "interview_focus": ["focuspunten voor het gesprek"]
}`,
          SYSTEM_BASE + "\nRetourneer alleen valid JSON."
        );
        break;
      }

      case "jobdigger_boolean_search": {
        response = await ollamaGenerate(model,
          `Genereer boolean search strings voor LinkedIn Recruiter:

FUNCTIE: ${args.function_title}
VERPLICHTE SKILLS: ${args.must_have_skills || "niet gespecificeerd"}
NICE-TO-HAVE: ${args.nice_to_have_skills || "niet gespecificeerd"}
UITSLUITEN: ${args.exclude || "recruiters, HR"}
LOCATIE: ${args.location || "Nederland"}

Retourneer JSON: {
  "primary_search": "beste boolean string (meest specifiek)",
  "broader_search": "bredere variant (meer resultaten)",
  "narrow_search": "striktere variant (minder maar betere resultaten)",
  "title_variations": ["alle relevante functietitel variaties (NL + EN)"],
  "skill_synonyms": { "skill": ["synoniemen/alternatieven"] },
  "search_tips": [
    "tips voor betere resultaten op LinkedIn Recruiter",
    "filters om toe te voegen",
    "alternatieve zoekstrategieen"
  ],
  "estimated_results": {
    "primary": "geschat aantal resultaten",
    "broader": "geschat aantal resultaten",
    "narrow": "geschat aantal resultaten"
  },
  "xray_google": "Google X-Ray search string als alternatief"
}`,
          SYSTEM_BASE + "\nRetourneer alleen valid JSON."
        );
        break;
      }

      // === V3: Complete Email Sequence Automation ===

      case "jobdigger_generate_sequence": {
        const isUrgent = args.urgency === "high";
        const isStartup = args.company_size === "startup" || args.company_size === "scale-up";

        // Determine timing based on urgency and company type
        const timings = isUrgent
          ? ["dag 0", "dag 5", "dag 10", "dag 17", "dag 31", "dag 45"]
          : ["dag 0", "dag 7", "dag 14", "dag 21", "dag 35", "dag 49"];

        const approaches = isStartup
          ? ["tech_shortage", "talent_pipeline", "team_scaling", "competitive_edge", "innovation_growth", "partnership"]
          : ["tech_shortage", "talent_pipeline", "team_scaling", "tech_expertise", "innovation_growth", "partnership"];

        response = await ollamaGenerate(model,
          `Genereer een complete 6-email outreach sequence voor een JobDigger lead:

BEDRIJF: ${args.company_name}
CONTACT: ${args.contact_name}${args.contact_role ? ` (${args.contact_role})` : ""}
VACATURE: ${args.vacancy_title}
TECH STACK: ${args.tech_stack || "niet bekend"}
BEDRIJFSTYPE: ${args.company_size || "mkb"}
URGENTIE: ${args.urgency || "medium"}

EMAIL SEQUENCE (6 emails):

Email 1 - ${approaches[0]} (${timings[0]}):
Invalshoek: Tech schaarste probleem + directe oplossing. PAS framework.

Email 2 - ${approaches[1]} (${timings[1]}):
Invalshoek: Talent pipeline aanbod + specialized sourcing. Value-First framework.

Email 3 - ${approaches[2]} (${timings[2]}):
Invalshoek: Team scaling case study + concrete resultaten. AIDA framework.

Email 4 - ${approaches[3]} (${timings[3]}):
Invalshoek: ${isStartup ? "Competitief voordeel via snelle hiring" : "Tech expertise matching + interview ondersteuning"}. Problem-Solution framework.

Email 5 - ${approaches[4]} (${timings[4]}):
Invalshoek: Innovation & growth via tech talent. Value-First framework.

Email 6 - ${approaches[5]} (${timings[5]}):
Invalshoek: Break-up email / partnership voorstel. Laatste kans. AIDA framework.

PER EMAIL:
- Max 150 woorden
- Persoonlijke toon (Wouter's stijl)
- Concrete referentie naar ${args.vacancy_title}
- 1 duidelijke CTA
- Geen markdown formatting
- Ondertekend: Wouter Arts, Recruitin

Retourneer JSON: {
  "sequence_strategy": "samenvatting van de gekozen strategie",
  "emails": [
    {
      "email_number": 1,
      "day": ${timings[0].replace("dag ", "")},
      "approach": "${approaches[0]}",
      "framework": "PAS/AIDA/Value-First/Problem-Solution",
      "subject": "email onderwerp",
      "body": "volledige email tekst",
      "cta": "specifieke call-to-action",
      "effectiveness_score": 1-10
    }
  ],
  "sequence_tips": ["tips voor maximale effectiviteit"],
  "expected_response_rate": "geschat %",
  "best_send_times": ["optimale verzendmomenten"]
}`,
          SEQUENCE_SYSTEM + "\nRetourneer alleen valid JSON."
        );
        break;
      }

      case "jobdigger_personalize_email": {
        const approachContext = {
          tech_shortage: "Focus op tech schaarste probleem en directe oplossing.",
          talent_pipeline: "Focus op talent pipeline aanbod en specialized sourcing.",
          team_scaling: "Focus op team scaling met case study.",
          innovation: "Focus op innovation en growth via tech talent.",
          partnership: "Focus op langetermijn partnership voorstel.",
          break_up: "Break-up email - laatste poging, respectvol, deur open laten.",
        };

        response = await ollamaGenerate(model,
          `Personaliseer deze email met extra context:

TEMPLATE:
${args.email_template}

BEDRIJF: ${args.company_name}
CONTACT: ${args.contact_name}
INVALSHOEK: ${approachContext[args.approach] || "algemeen tech recruitment"}

EXTRA CONTEXT VOOR PERSONALISATIE:
${args.personalization_context || "geen extra context"}

Pas de email aan door:
1. De extra context natuurlijk te verwerken (niet geforceerd)
2. Specifieke referenties naar het bedrijf/contact toe te voegen
3. De toon persoonlijker te maken
4. De relevantie te verhogen

REGELS:
- Behoud de originele structuur en invalshoek
- Max 150 woorden
- Geen markdown formatting in de email
- Ondertekend door Wouter Arts, Recruitin
- Natuurlijk en niet over-gepersonaliseerd

Retourneer de volledige gepersonaliseerde email tekst.`,
          SEQUENCE_SYSTEM
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
  console.error(`JobDigger MCP running (${OLLAMA_BASE_URL}, model: ${DEFAULT_MODEL})`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
