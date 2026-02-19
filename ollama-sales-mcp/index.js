#!/usr/bin/env node

/**
 * Ollama Sales MCP - Lead Generatie & Email Processing
 *
 * Tools:
 * - sales_score_prospect: Score een bedrijf als prospect (0-100)
 * - sales_generate_outreach: Genereer koude acquisitie email sequence
 * - sales_email_sentiment: Analyseer sentiment van inkomende email
 * - sales_draft_reply: Genereer antwoord op email
 * - sales_classify_email: Classificeer email (lead/klant/spam/info)
 * - sales_extract_lead_info: Haal contactgegevens uit email/text
 * - sales_followup_sequence: Genereer follow-up sequence (3-5 emails)
 * - sales_objection_handler: Genereer antwoord op bezwaar
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const DEFAULT_MODEL = process.env.OLLAMA_DEFAULT_MODEL || "llama3.2";

const SYSTEM_BASE = `Je bent Wouter's AI sales assistent voor Recruitin, een technisch recruitment bureau in Arnhem.
Toon: Direct, eerlijk, data-driven, geen bullshit. Altijd in het Nederlands tenzij anders gevraagd.
Sector: Technische recruitment - Engineering, Automation, Manufacturing, IT.
USP: Persoonlijke aanpak, arbeidsmarkt expertise, snelle plaatsingen.`;

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
  { name: "ollama-sales-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "sales_score_prospect",
      description: "Score een bedrijf als recruitment prospect (0-100). Analyseert sector fit, grootte, hiring signals en potentieel.",
      inputSchema: {
        type: "object",
        properties: {
          company_name: { type: "string", description: "Bedrijfsnaam" },
          company_info: { type: "string", description: "Beschikbare info over het bedrijf (website tekst, LinkedIn, etc.)" },
          sector: { type: "string", description: "Sector (bijv. manufacturing, IT, engineering)" },
        },
        required: ["company_name", "company_info"],
      },
    },
    {
      name: "sales_generate_outreach",
      description: "Genereer een persoonlijke koude acquisitie email voor een prospect. Wouter's directe stijl.",
      inputSchema: {
        type: "object",
        properties: {
          company_name: { type: "string", description: "Bedrijfsnaam" },
          contact_name: { type: "string", description: "Naam contactpersoon" },
          contact_role: { type: "string", description: "Functie contactpersoon" },
          company_context: { type: "string", description: "Context over het bedrijf (vacatures, groei, nieuws)" },
          angle: { type: "string", description: "Invalshoek (bijv. 'moeilijk vervulbare vacature', 'groei', 'concurrentie')" },
        },
        required: ["company_name", "contact_name"],
      },
    },
    {
      name: "sales_email_sentiment",
      description: "Analyseer sentiment en intentie van een inkomende email. Retourneert sentiment score, urgentie, en aanbevolen actie.",
      inputSchema: {
        type: "object",
        properties: {
          email_subject: { type: "string", description: "Email onderwerp" },
          email_body: { type: "string", description: "Email inhoud" },
          sender_context: { type: "string", description: "Optioneel: context over de afzender (klant, prospect, etc.)" },
        },
        required: ["email_body"],
      },
    },
    {
      name: "sales_draft_reply",
      description: "Genereer een concept antwoord op een email in Wouter's stijl.",
      inputSchema: {
        type: "object",
        properties: {
          email_body: { type: "string", description: "Originele email" },
          intent: { type: "string", enum: ["accept", "decline", "more_info", "schedule_call", "proposal", "followup"], description: "Gewenste intentie van het antwoord" },
          context: { type: "string", description: "Extra context voor het antwoord" },
        },
        required: ["email_body", "intent"],
      },
    },
    {
      name: "sales_classify_email",
      description: "Classificeer een email: type, prioriteit, en of actie nodig is.",
      inputSchema: {
        type: "object",
        properties: {
          email_subject: { type: "string", description: "Email onderwerp" },
          email_body: { type: "string", description: "Email inhoud" },
          sender: { type: "string", description: "Afzender" },
        },
        required: ["email_body"],
      },
    },
    {
      name: "sales_extract_lead_info",
      description: "Extraheer gestructureerde lead/contact informatie uit email of tekst. Retourneert JSON.",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string", description: "Email of tekst met contactgegevens" },
        },
        required: ["text"],
      },
    },
    {
      name: "sales_followup_sequence",
      description: "Genereer een complete follow-up email sequence (3-5 emails) voor een prospect.",
      inputSchema: {
        type: "object",
        properties: {
          company_name: { type: "string", description: "Bedrijfsnaam" },
          contact_name: { type: "string", description: "Naam contactpersoon" },
          initial_context: { type: "string", description: "Context van eerste contact/gesprek" },
          num_emails: { type: "number", description: "Aantal emails in sequence (default: 4)" },
        },
        required: ["company_name", "contact_name"],
      },
    },
    {
      name: "sales_objection_handler",
      description: "Genereer een overtuigend antwoord op een sales bezwaar.",
      inputSchema: {
        type: "object",
        properties: {
          objection: { type: "string", description: "Het bezwaar (bijv. 'te duur', 'we doen het zelf', 'geen budget')" },
          prospect_context: { type: "string", description: "Context over de prospect" },
        },
        required: ["objection"],
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
      case "sales_score_prospect": {
        response = await ollamaGenerate(model,
          `Score dit bedrijf als recruitment prospect voor Recruitin.

BEDRIJF: ${args.company_name}
SECTOR: ${args.sector || "onbekend"}
INFO: ${args.company_info}

Beoordeel op: sector fit (technisch/engineering), bedrijfsgrootte, hiring signals, bereikbaarheid, potentieel volume.
Retourneer JSON: { "score": 0-100, "sector_fit": "hoog/midden/laag", "hiring_signals": [...], "potential_value": "hoog/midden/laag", "recommended_approach": "...", "reason": "..." }`,
          SYSTEM_BASE + "\nJe bent een prospect scoring expert. Retourneer alleen valid JSON."
        );
        break;
      }

      case "sales_generate_outreach": {
        response = await ollamaGenerate(model,
          `Schrijf een koude acquisitie email voor Recruitin.

AAN: ${args.contact_name}${args.contact_role ? `, ${args.contact_role}` : ""} bij ${args.company_name}
CONTEXT: ${args.company_context || "geen specifieke context"}
INVALSHOEK: ${args.angle || "algemeen technisch recruitment"}

Regels:
- Max 150 woorden
- Persoonlijk en direct (Wouter's stijl)
- Geen bullshit of corporate taal
- 1 concrete vraag/CTA
- Ondertekend door Wouter Arts, Recruitin`,
          SYSTEM_BASE
        );
        break;
      }

      case "sales_email_sentiment": {
        response = await ollamaGenerate(model,
          `Analyseer deze email:

ONDERWERP: ${args.email_subject || "(geen)"}
AFZENDER CONTEXT: ${args.sender_context || "onbekend"}

EMAIL:
${args.email_body}

Retourneer JSON: { "sentiment": "positief/neutraal/negatief", "sentiment_score": -1.0 tot 1.0, "urgency": "hoog/midden/laag", "intent": "...", "key_topics": [...], "action_required": true/false, "recommended_action": "...", "reply_priority": "direct/vandaag/deze_week/geen" }`,
          SYSTEM_BASE + "\nJe bent een email analyse expert. Retourneer alleen valid JSON."
        );
        break;
      }

      case "sales_draft_reply": {
        const intentMap = {
          accept: "Positief accepteren, afspraak maken",
          decline: "Beleefd afwijzen maar deur open houden",
          more_info: "Meer informatie vragen",
          schedule_call: "Belafspraak voorstellen",
          proposal: "Voorstel/offerte aanbieden",
          followup: "Opvolging van eerder contact",
        };
        response = await ollamaGenerate(model,
          `Schrijf een antwoord op deze email.

ORIGINEEL:
${args.email_body}

INTENTIE: ${intentMap[args.intent] || args.intent}
EXTRA CONTEXT: ${args.context || "geen"}

Regels: Direct, persoonlijk, max 100 woorden. Ondertekend door Wouter.`,
          SYSTEM_BASE
        );
        break;
      }

      case "sales_classify_email": {
        response = await ollamaGenerate(model,
          `Classificeer deze email:

VAN: ${args.sender || "onbekend"}
ONDERWERP: ${args.email_subject || "(geen)"}
INHOUD:
${args.email_body}

Retourneer JSON: { "type": "lead/klant/prospect/leverancier/spam/newsletter/info/sollicitatie", "priority": "urgent/hoog/normaal/laag", "action_required": true/false, "category": "sales/service/admin/marketing", "summary": "1 zin samenvatting", "suggested_label": "..." }`,
          SYSTEM_BASE + "\nJe bent een email classificatie expert. Retourneer alleen valid JSON."
        );
        break;
      }

      case "sales_extract_lead_info": {
        response = await ollamaGenerate(model,
          `Extraheer alle contact/lead informatie uit deze tekst:

${args.text}

Retourneer JSON: { "name": "...", "email": "...", "phone": "...", "company": "...", "role": "...", "linkedin": "...", "website": "...", "sector": "...", "notes": "..." }. Gebruik null voor ontbrekende velden.`,
          SYSTEM_BASE + "\nRetourneer alleen valid JSON."
        );
        break;
      }

      case "sales_followup_sequence": {
        const num = args.num_emails || 4;
        response = await ollamaGenerate(model,
          `Maak een follow-up email sequence van ${num} emails voor:

BEDRIJF: ${args.company_name}
CONTACT: ${args.contact_name}
CONTEXT: ${args.initial_context || "eerste koude outreach"}

Per email:
- Dag X (wanneer versturen na vorige)
- Onderwerp
- Inhoud (max 100 woorden per email)

Elke email moet een andere invalshoek hebben. Laatste email = break-up email.
Format: JSON array met { "day": number, "subject": "...", "body": "..." }`,
          SYSTEM_BASE + "\nRetourneer alleen valid JSON array."
        );
        break;
      }

      case "sales_objection_handler": {
        response = await ollamaGenerate(model,
          `Een prospect heeft dit bezwaar: "${args.objection}"

CONTEXT: ${args.prospect_context || "technisch recruitment prospect"}

Geef:
1. Erkenning van het bezwaar
2. Herkadering vanuit waarde
3. Bewijs/voorbeeld uit de praktijk
4. Concrete vervolgvraag

Wouter's stijl: direct, eerlijk, geen gladde praatjes. Max 150 woorden.`,
          SYSTEM_BASE
        );
        break;
      }

      default:
        return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
    }

    return { content: [{ type: "text", text: response }] };
  } catch (error) {
    const hint = error.message.includes("ECONNREFUSED")
      ? "\n\nIs Ollama running? Start: ollama serve" : "";
    return { content: [{ type: "text", text: `Error: ${error.message}${hint}` }], isError: true };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Ollama Sales MCP running (${OLLAMA_BASE_URL}, model: ${DEFAULT_MODEL})`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
