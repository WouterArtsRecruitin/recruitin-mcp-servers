#!/usr/bin/env node

/**
 * Ollama Content MCP - Dagelijkse Content Generatie
 *
 * Tools:
 * - content_linkedin_post: Genereer LinkedIn post (thought leadership, vacature, tips)
 * - content_linkedin_carousel: Genereer LinkedIn carousel/slides content
 * - content_meta_campaign: Genereer Meta/Facebook/Instagram campagne teksten
 * - content_hashtag_strategy: Genereer hashtag strategie voor post
 * - content_ab_variants: Genereer A/B test varianten van tekst
 * - content_weekly_calendar: Genereer wekelijks content kalender
 * - content_repurpose: Hergebruik content naar ander format (blog→post, post→carousel, etc.)
 * - content_engagement_hooks: Genereer engagement hooks en openers
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const DEFAULT_MODEL = process.env.OLLAMA_DEFAULT_MODEL || "llama3.2";

const SYSTEM_BASE = `Je bent Wouter Arts' content creator voor Recruitin, een technisch recruitment bureau in Arnhem.
Wouter's stijl: Direct, eerlijk, data-driven, geen corporate bullshit. Persoonlijk en authentiek.
Thema's: Technisch recruitment, arbeidsmarkt, candidate experience, employer branding, AI in recruitment.
Doelgroep: HR managers, hiring managers, tech leads, engineers die van baan willen wisselen.
Platform: LinkedIn (primair), Meta/Instagram (secundair).
Taal: Nederlands, tenzij anders gevraagd.`;

const LINKEDIN_SYSTEM = `${SYSTEM_BASE}

LinkedIn specifiek:
- Hook in eerste 2 regels (moet scrollen triggeren)
- Korte alinea's (max 2-3 zinnen)
- Wit regels tussen alinea's
- Persoonlijk perspectief (ik-vorm)
- Concrete cijfers en voorbeelden
- Eindig met vraag of CTA
- Max 1300 karakters voor optimale reach
- Geen emojis overload (max 3-5 per post)`;

const META_SYSTEM = `${SYSTEM_BASE}

Meta/Facebook/Instagram specifiek:
- Korte, pakkende teksten (max 125 karakters primary text voor ads)
- Sterke visual hooks
- Duidelijke CTA
- Doelgroep targeting suggesties
- A/B test varianten
- Geschikt voor zowel feed als stories`;

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
  { name: "ollama-content-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "content_linkedin_post",
      description: "Genereer een LinkedIn post in Wouter's stijl. Keuze uit: thought leadership, vacature promotie, arbeidsmarkt tips, behind-the-scenes, poll.",
      inputSchema: {
        type: "object",
        properties: {
          topic: { type: "string", description: "Onderwerp van de post" },
          type: { type: "string", enum: ["thought_leadership", "vacature", "tip", "behind_the_scenes", "poll", "case_study", "markt_update"], description: "Type post" },
          tone: { type: "string", enum: ["inspirerend", "provocerend", "informatief", "persoonlijk", "humoristisch"], description: "Toon (default: persoonlijk)" },
          include_cta: { type: "boolean", description: "Inclusief call-to-action (default: true)" },
          vacancy_details: { type: "string", description: "Vacature details (alleen bij type=vacature)" },
        },
        required: ["topic"],
      },
    },
    {
      name: "content_linkedin_carousel",
      description: "Genereer content voor LinkedIn carousel/document post (5-10 slides). Inclusief slide titels en teksten.",
      inputSchema: {
        type: "object",
        properties: {
          topic: { type: "string", description: "Onderwerp van de carousel" },
          num_slides: { type: "number", description: "Aantal slides (default: 7)" },
          style: { type: "string", enum: ["tips", "stappenplan", "mythes_vs_feiten", "checklist", "data_story"], description: "Carousel stijl" },
        },
        required: ["topic"],
      },
    },
    {
      name: "content_meta_campaign",
      description: "Genereer Meta/Facebook/Instagram campagne teksten inclusief primary text, headline, description en targeting suggesties.",
      inputSchema: {
        type: "object",
        properties: {
          campaign_goal: { type: "string", enum: ["brand_awareness", "lead_generation", "vacature_promotie", "website_traffic", "employer_branding"], description: "Campagne doel" },
          target_audience: { type: "string", description: "Doelgroep beschrijving" },
          product_service: { type: "string", description: "Wat promoot je (vacature, dienst, content)" },
          budget_level: { type: "string", enum: ["laag", "midden", "hoog"], description: "Budget niveau (voor strategy tips)" },
        },
        required: ["campaign_goal", "product_service"],
      },
    },
    {
      name: "content_hashtag_strategy",
      description: "Genereer een hashtag strategie voor een LinkedIn post of campagne. Mix van niche, industrie en trending hashtags.",
      inputSchema: {
        type: "object",
        properties: {
          topic: { type: "string", description: "Post onderwerp" },
          platform: { type: "string", enum: ["linkedin", "instagram", "both"], description: "Platform (default: linkedin)" },
          num_hashtags: { type: "number", description: "Aantal hashtags (default: 5 voor LinkedIn, 15 voor Instagram)" },
        },
        required: ["topic"],
      },
    },
    {
      name: "content_ab_variants",
      description: "Genereer 2-3 A/B test varianten van een tekst. Verschillende hooks, CTAs en tonen.",
      inputSchema: {
        type: "object",
        properties: {
          original_text: { type: "string", description: "Originele tekst" },
          element_to_test: { type: "string", enum: ["hook", "cta", "tone", "length", "all"], description: "Welk element testen" },
          num_variants: { type: "number", description: "Aantal varianten (default: 3)" },
        },
        required: ["original_text"],
      },
    },
    {
      name: "content_weekly_calendar",
      description: "Genereer een wekelijks content kalender met 5 posts (ma-vr). Mix van content types en thema's.",
      inputSchema: {
        type: "object",
        properties: {
          week_theme: { type: "string", description: "Optioneel weekthema" },
          focus_vacatures: { type: "string", description: "Huidige open vacatures om te promoten (komma-gescheiden)" },
          sector_focus: { type: "string", description: "Sector focus deze week" },
        },
        required: [],
      },
    },
    {
      name: "content_repurpose",
      description: "Hergebruik bestaande content naar een ander format. Blog naar LinkedIn, post naar carousel, artikel naar social.",
      inputSchema: {
        type: "object",
        properties: {
          source_content: { type: "string", description: "Broninhoud" },
          source_format: { type: "string", enum: ["blog", "linkedin_post", "artikel", "vacature", "email", "rapport"], description: "Bron format" },
          target_format: { type: "string", enum: ["linkedin_post", "carousel", "meta_ad", "instagram_story", "twitter_thread", "email_newsletter"], description: "Doel format" },
        },
        required: ["source_content", "source_format", "target_format"],
      },
    },
    {
      name: "content_engagement_hooks",
      description: "Genereer 5-10 engagement hooks/openers voor een onderwerp. Scroll-stoppers voor social media.",
      inputSchema: {
        type: "object",
        properties: {
          topic: { type: "string", description: "Onderwerp" },
          style: { type: "string", enum: ["controversial", "data_driven", "personal_story", "question", "myth_busting"], description: "Hook stijl" },
          num_hooks: { type: "number", description: "Aantal hooks (default: 7)" },
        },
        required: ["topic"],
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
      case "content_linkedin_post": {
        const typeInstructions = {
          thought_leadership: "Deel een scherp inzicht of mening over dit onderwerp. Neem een standpunt in. Wees niet bang om te polariseren.",
          vacature: `Promoot deze vacature op een creatieve manier. NIET 'wij zoeken een...'. Vertel het verhaal achter de functie.\n\nVACATURE DETAILS: ${args.vacancy_details || "gebruik het onderwerp als basis"}`,
          tip: "Deel een praktische, direct toepasbare tip. Concrete stappen, geen vage adviezen.",
          behind_the_scenes: "Deel een kijkje achter de schermen bij Recruitin. Eerlijk, persoonlijk, kwetsbaar als het past.",
          poll: "Maak een poll met 3-4 opties. Gebruik een controversieel of verrassend onderwerp om engagement te triggeren.",
          case_study: "Vertel een succesverhaal (geanonimiseerd). Probleem → aanpak → resultaat. Concrete cijfers.",
          markt_update: "Deel arbeidsmarkt data of trends. Maak het relevant voor je netwerk. Voeg je eigen analyse toe.",
        };

        const toneInstructions = {
          inspirerend: "Inspirerend en motiverend. Laat mensen nadenken.",
          provocerend: "Provocerend en uitdagend. Stel de status quo ter discussie.",
          informatief: "Informatief en educatief. Deel kennis genereus.",
          persoonlijk: "Persoonlijk en authentiek. Deel je eigen ervaring.",
          humoristisch: "Luchtig en humoristisch. Recruitment mag ook leuk zijn.",
        };

        response = await ollamaGenerate(model,
          `Schrijf een LinkedIn post over: ${args.topic}

TYPE: ${typeInstructions[args.type] || typeInstructions.thought_leadership}
TOON: ${toneInstructions[args.tone] || toneInstructions.persoonlijk}

STRUCTUUR:
1. Hook (eerste 2 regels - moet scroll-stoppen)
2. Body (kort, puntig, wit regels)
3. ${args.include_cta !== false ? "Call-to-action of vraag aan je netwerk" : "Afsluitende gedachte"}

REGELS:
- Max 1300 karakters
- Korte zinnen en alinea's
- Persoonlijk (ik-vorm)
- Geen corporate jargon
- Max 3-5 relevante emojis
- Inclusief 3-5 hashtags onderaan

Schrijf de post direct, geen intro of uitleg.`,
          LINKEDIN_SYSTEM
        );
        break;
      }

      case "content_linkedin_carousel": {
        const numSlides = args.num_slides || 7;
        const styleInstructions = {
          tips: "Elke slide = 1 concrete tip met korte toelichting",
          stappenplan: "Stap-voor-stap proces, logische volgorde",
          mythes_vs_feiten: "Links mythe, rechts feit. Verrassende tegenstellingen.",
          checklist: "Afvinkbare items, praktisch en direct toepasbaar",
          data_story: "Data + inzichten, vertel een verhaal met cijfers",
        };

        response = await ollamaGenerate(model,
          `Maak een LinkedIn carousel van ${numSlides} slides over: ${args.topic}

STIJL: ${styleInstructions[args.style] || styleInstructions.tips}

FORMAT per slide:
Slide [nummer]:
TITEL: [max 5 woorden, bold]
SUBTEKST: [max 2 zinnen]
VISUEEL: [beschrijving van gewenste visual/icoon]

STRUCTUUR:
- Slide 1: Cover slide (pakkende titel + ondertitel)
- Slide 2-${numSlides - 1}: Content slides
- Slide ${numSlides}: CTA slide (volg mij / bezoek website / reageer)

REGELS:
- Weinig tekst per slide (scanbaar)
- Progressie in de slides
- Elke slide moet waarde bieden
- Consistent design thema

Retourneer ook:
- POST TEKST: begeleidende LinkedIn post tekst (max 300 karakters)
- HASHTAGS: 5 relevante hashtags`,
          LINKEDIN_SYSTEM
        );
        break;
      }

      case "content_meta_campaign": {
        const goalInstructions = {
          brand_awareness: "Vergroot naamsbekendheid van Recruitin. Bereik zo veel mogelijk relevante professionals.",
          lead_generation: "Genereer leads (contactgegevens). Bied waarde in ruil voor gegevens (whitepaper, checklist, gratis scan).",
          vacature_promotie: "Promoot een specifieke vacature. Trek gekwalificeerde kandidaten aan.",
          website_traffic: "Stuur traffic naar recruitin.nl. Overtuig om door te klikken.",
          employer_branding: "Positioneer klant-bedrijven als aantrekkelijke werkgever. Showcase cultuur en team.",
        };

        response = await ollamaGenerate(model,
          `Maak een complete Meta (Facebook/Instagram) campagne:

DOEL: ${goalInstructions[args.campaign_goal] || args.campaign_goal}
PRODUCT/DIENST: ${args.product_service}
DOELGROEP: ${args.target_audience || "technische professionals, 25-45, Nederland"}
BUDGET: ${args.budget_level || "midden"}

Retourneer JSON: {
  "campaign_name": "...",
  "ad_sets": [
    {
      "name": "Ad Set naam",
      "targeting": {
        "age_range": "...",
        "interests": [...],
        "job_titles": [...],
        "locations": [...],
        "exclusions": [...]
      },
      "ads": [
        {
          "name": "Ad variant naam",
          "primary_text": "max 125 karakters - hoofdtekst",
          "headline": "max 40 karakters",
          "description": "max 30 karakters",
          "cta_button": "Meer info/Solliciteer/Download/Contact",
          "visual_suggestion": "beschrijving gewenste afbeelding/video"
        }
      ]
    }
  ],
  "budget_tips": ["budget optimalisatie tips"],
  "kpis": { "expected_ctr": "...", "expected_cpl": "...", "expected_reach": "..." },
  "optimization_tips": ["campagne optimalisatie tips"]
}`,
          META_SYSTEM + "\nRetourneer alleen valid JSON."
        );
        break;
      }

      case "content_hashtag_strategy": {
        const platform = args.platform || "linkedin";
        const numHashtags = args.num_hashtags || (platform === "instagram" ? 15 : 5);

        response = await ollamaGenerate(model,
          `Genereer een hashtag strategie voor ${platform}:

ONDERWERP: ${args.topic}
AANTAL: ${numHashtags} hashtags

Retourneer JSON: {
  "primary_hashtags": ["2-3 niche hashtags met hoog engagement, laag volume"],
  "industry_hashtags": ["2-3 industrie standaard hashtags"],
  "trending_hashtags": ["1-2 trending/actuele hashtags"],
  "branded_hashtags": ["1 Recruitin branded hashtag"],
  "avoid": ["hashtags om te vermijden en waarom"],
  "strategy_tip": "wanneer en hoe deze mix gebruiken"
}`,
          SYSTEM_BASE + "\nRetourneer alleen valid JSON."
        );
        break;
      }

      case "content_ab_variants": {
        const numVariants = args.num_variants || 3;
        const elementInstructions = {
          hook: "Varieer alleen de opening/hook. Behoud de rest van de boodschap.",
          cta: "Varieer alleen de call-to-action. Behoud de rest van de boodschap.",
          tone: "Varieer de toon (formeel vs informeel vs provocerend). Zelfde boodschap.",
          length: "Varieer de lengte (kort, medium, lang). Zelfde kern boodschap.",
          all: "Varieer alles: hook, toon, structuur, CTA. Zelfde kern boodschap.",
        };

        response = await ollamaGenerate(model,
          `Genereer ${numVariants} A/B test varianten:

ORIGINEEL:
${args.original_text}

ELEMENT: ${elementInstructions[args.element_to_test] || elementInstructions.all}

Retourneer JSON: {
  "original": "originele tekst (ongewijzigd)",
  "variants": [
    {
      "variant_id": "A/B/C",
      "text": "variant tekst",
      "changes": "wat is er anders",
      "hypothesis": "waarom dit beter zou kunnen werken",
      "best_for": "welke doelgroep/situatie"
    }
  ],
  "test_recommendation": "welke variant eerst testen en waarom",
  "measurement_tips": "hoe resultaten meten"
}`,
          SYSTEM_BASE + "\nRetourneer alleen valid JSON."
        );
        break;
      }

      case "content_weekly_calendar": {
        response = await ollamaGenerate(model,
          `Genereer een wekelijks content kalender voor Recruitin's LinkedIn:

WEEKTHEMA: ${args.week_theme || "geen specifiek thema - mix van onderwerpen"}
VACATURES: ${args.focus_vacatures || "geen specifieke vacatures"}
SECTOR: ${args.sector_focus || "technisch recruitment breed"}

KALENDER (ma-vr):

Retourneer JSON: {
  "week_theme": "...",
  "posts": [
    {
      "day": "maandag",
      "time": "optimale post-tijd",
      "type": "thought_leadership/vacature/tip/behind_the_scenes/poll/case_study/markt_update",
      "topic": "onderwerp",
      "hook": "eerste 2 regels (scroll-stopper)",
      "summary": "korte samenvatting van de post",
      "hashtags": ["3-5 hashtags"],
      "visual": "type visual (foto/carousel/video/grafiek)",
      "engagement_goal": "likes/comments/shares/saves"
    }
  ],
  "tips": ["week-specifieke tips voor maximaal bereik"],
  "content_mix": { "thought_leadership": "X%", "vacatures": "X%", "tips": "X%", "persoonlijk": "X%" }
}`,
          LINKEDIN_SYSTEM + "\nRetourneer alleen valid JSON."
        );
        break;
      }

      case "content_repurpose": {
        const formatInstructions = {
          linkedin_post: "LinkedIn post (max 1300 karakters, hook + body + CTA, wit regels)",
          carousel: "LinkedIn carousel (7 slides, kort per slide, visueel denken)",
          meta_ad: "Meta advertentie (primary text max 125 kar, headline max 40 kar, description max 30 kar)",
          instagram_story: "Instagram story slides (5-7 slides, max 3 regels per slide, visueel)",
          twitter_thread: "Twitter/X thread (5-8 tweets, max 280 karakters per tweet, genummerd)",
          email_newsletter: "Email newsletter sectie (onderwerp, preview, body max 200 woorden, CTA)",
        };

        response = await ollamaGenerate(model,
          `Hergebruik deze content naar een nieuw format:

BRON FORMAT: ${args.source_format}
BRON CONTENT:
${args.source_content}

DOEL FORMAT: ${formatInstructions[args.target_format] || args.target_format}

Regels:
- Behoud de kernboodschap
- Pas aan voor het nieuwe platform/format
- Optimaliseer voor engagement op het doelplatform
- Voeg platform-specifieke elementen toe (hashtags, CTA, etc.)

Genereer de complete hergebruikte content, klaar om te publiceren.`,
          SYSTEM_BASE
        );
        break;
      }

      case "content_engagement_hooks": {
        const numHooks = args.num_hooks || 7;
        const styleInstructions = {
          controversial: "Controversieel en polariserend. Neem een standpunt in dat reacties uitlokt.",
          data_driven: "Data en cijfers als hook. Verrassende statistieken die scrollen stoppen.",
          personal_story: "Persoonlijke ervaring als hook. Kwetsbaar, eerlijk, herkenbaar.",
          question: "Directe vraag aan de lezer. Retorisch of echt uitnodigend.",
          myth_busting: "Ontkracht een gangbare mythe. 'Iedereen denkt dat... maar eigenlijk...'",
        };

        response = await ollamaGenerate(model,
          `Genereer ${numHooks} scroll-stopping hooks voor LinkedIn:

ONDERWERP: ${args.topic}
STIJL: ${styleInstructions[args.style] || "Mix van stijlen"}

Per hook:
- Max 2 regels (moet boven de fold passen)
- Moet nieuwsgierig maken
- Moet scrollen stoppen

Retourneer JSON: {
  "hooks": [
    {
      "hook": "de hook tekst",
      "style": "stijl type",
      "expected_engagement": "hoog/midden/laag",
      "best_for": "welk type post past hier het best bij",
      "follow_up_angle": "hoe je de post na deze hook kunt opbouwen"
    }
  ],
  "top_pick": "welke hook is de sterkste en waarom"
}`,
          LINKEDIN_SYSTEM + "\nRetourneer alleen valid JSON."
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
  console.error(`Ollama Content MCP running (${OLLAMA_BASE_URL}, model: ${DEFAULT_MODEL})`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
