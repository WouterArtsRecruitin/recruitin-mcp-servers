#!/usr/bin/env node
/**
 * Recruitin Sales MCP Server
 * Tools: vacature analyse, arbeidsmarkt scan, fee calculator, pipedrive, email, pitch
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

// Constants
const FEE = { RETAINER: 19, NCNP: 24, MONTHS: 12.96 };
const SCARCITY = { bouw: 65, equipment: 65, industrie: 59, techniek: 58, ict: 55, zorg: 52 };
const REGIONS = ['Gelderland', 'Overijssel', 'Noord-Brabant', 'Utrecht', 'Zuid-Holland'];
const TARGETS = {
  equipment: ['Kuiken', 'SMT', 'Hitachi NL', 'Liebherr NL'],
  automotive: ['DAF', 'Scania', 'MAN', 'Mercedes Trucks'],
};
const TIMELINES = {
  standard: [
    { week: 'Week 1-2', action: 'Intake + profiel' },
    { week: 'Week 2-4', action: 'Sourcing + gesprekken' },
    { week: 'Week 4-6', action: 'Presentatie kandidaten' },
    { week: 'Week 6-8', action: 'Interviews' },
    { week: 'Week 8-10', action: 'Selectie + contract' },
  ],
  withHoliday: [
    { week: 'Week 1-2', action: 'Intake + profiel' },
    { week: 'Week 2-4', action: 'Sourcing + gesprekken' },
    { week: 'Week 4-5', action: 'Kerstvakantie' },
    { week: 'Week 6-8', action: 'Presentatie kandidaten' },
    { week: 'Week 8-10', action: 'Interviews' },
    { week: 'Week 10-12', action: 'Selectie + contract' },
  ],
};

// Helper functions
const getScarcity = (sector) => SCARCITY[sector.toLowerCase()] || 50;
const calcFees = (min, max, bonus = 0) => {
  const annMin = min * FEE.MONTHS * (1 + bonus / 100);
  const annMax = max * FEE.MONTHS * (1 + bonus / 100);
  return {
    annual: { min: Math.round(annMin), max: Math.round(annMax) },
    retainer: { pct: FEE.RETAINER, min: Math.round(annMin * FEE.RETAINER / 100), max: Math.round(annMax * FEE.RETAINER / 100) },
    ncnp: { pct: FEE.NCNP, min: Math.round(annMin * FEE.NCNP / 100), max: Math.round(annMax * FEE.NCNP / 100) },
  };
};

const pipedriveSearch = async (apiKey, type, term) => {
  if (!apiKey || !term) return null;
  try {
    const res = await axios.get(`https://api.pipedrive.com/v1/${type}/search`, {
      params: { term, api_token: apiKey },
    });
    return res.data?.data?.items?.[0]?.item?.id || null;
  } catch { return null; }
};

const pipedriveCreate = async (apiKey, endpoint, data) => {
  const res = await axios.post(`https://api.pipedrive.com/v1/${endpoint}`, data, {
    params: { api_token: apiKey },
  });
  return res.data?.data?.id;
};

// Server setup
const server = new Server({ name: "recruitin-sales-mcp", version: "1.0.0" }, { capabilities: { tools: {} } });

const TOOLS = [
  { name: "recruitin_labor_market", description: "Arbeidsmarkt quickscan (UWV 2025)", inputSchema: { type: "object", properties: { sector: { type: "string" } }, required: ["sector"] } },
  { name: "recruitin_fees", description: "Fee calculator (19% retainer / 24% NCNP)", inputSchema: { type: "object", properties: { salaryMin: { type: "number" }, salaryMax: { type: "number" }, bonus: { type: "number" } }, required: ["salaryMin", "salaryMax"] } },
  { name: "recruitin_pipedrive_check", description: "Check duplicaten in Pipedrive", inputSchema: { type: "object", properties: { email: { type: "string" }, orgName: { type: "string" } } } },
  { name: "recruitin_pipedrive_create", description: "Maak person/org/deal in Pipedrive", inputSchema: { type: "object", properties: { personName: { type: "string" }, email: { type: "string" }, phone: { type: "string" }, orgName: { type: "string" }, dealTitle: { type: "string" }, dealValue: { type: "number" } }, required: ["personName", "orgName", "dealTitle"] } },
  { name: "recruitin_email", description: "Genereer email template", inputSchema: { type: "object", properties: { firstName: { type: "string" }, company: { type: "string" }, jobTitle: { type: "string" }, scarcity: { type: "number" } }, required: ["firstName", "company", "jobTitle"] } },
  { name: "recruitin_pitch", description: "Genereer sales pitch data", inputSchema: { type: "object", properties: { jobTitle: { type: "string" }, company: { type: "string" }, salaryMin: { type: "number" }, salaryMax: { type: "number" }, bonus: { type: "number" }, sector: { type: "string" }, timeline: { type: "string" } }, required: ["jobTitle", "company", "salaryMin", "salaryMax", "sector"] } },
  { name: "recruitin_workflow", description: "Complete workflow: arbeidsmarkt + fees + pipedrive + email + pitch", inputSchema: { type: "object", properties: { jobTitle: { type: "string" }, company: { type: "string" }, contactName: { type: "string" }, contactEmail: { type: "string" }, salaryMin: { type: "number" }, salaryMax: { type: "number" }, bonus: { type: "number" }, sector: { type: "string" }, timeline: { type: "string" }, createPipedrive: { type: "boolean" } }, required: ["jobTitle", "company", "salaryMin", "salaryMax", "sector"] } },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  const apiKey = process.env.PIPEDRIVE_API_KEY || '';

  let result;
  switch (name) {
    case "recruitin_labor_market":
      result = { sector: args.sector, scarcity: getScarcity(args.sector), regions: REGIONS, source: 'UWV 2025' };
      break;

    case "recruitin_fees":
      result = calcFees(args.salaryMin, args.salaryMax, args.bonus || 0);
      break;

    case "recruitin_pipedrive_check":
      result = {
        personId: await pipedriveSearch(apiKey, 'persons', args.email),
        orgId: await pipedriveSearch(apiKey, 'organizations', args.orgName),
      };
      break;

    case "recruitin_pipedrive_create": {
      const existingOrg = await pipedriveSearch(apiKey, 'organizations', args.orgName);
      const existingPerson = await pipedriveSearch(apiKey, 'persons', args.email);
      
      const orgId = existingOrg || await pipedriveCreate(apiKey, 'organizations', { name: args.orgName });
      const personId = existingPerson || await pipedriveCreate(apiKey, 'persons', {
        name: args.personName,
        email: args.email ? [{ value: args.email, primary: true }] : undefined,
        phone: args.phone ? [{ value: args.phone, primary: true }] : undefined,
        org_id: orgId,
      });
      const dealId = await pipedriveCreate(apiKey, 'deals', {
        title: args.dealTitle,
        value: args.dealValue,
        currency: 'EUR',
        person_id: personId,
        org_id: orgId,
      });
      result = { orgId, personId, dealId, created: { org: !existingOrg, person: !existingPerson, deal: true } };
      break;
    }

    case "recruitin_email":
      result = {
        subject: `Vacature ${args.jobTitle} - Recruitin kan helpen`,
        body: `Beste ${args.firstName},\n\nIk zag dat ${args.company} op zoek is naar een ${args.jobTitle}.\n\nMet ${args.scarcity || 50}% krapte in jullie sector begrijp ik dat dit een uitdaging kan zijn.\n\nRecruitin is gespecialiseerd in technisch recruitment. Graag bespreek ik hoe wij kunnen helpen.\n\nKan ik je deze week 15 minuten bellen?\n\nMet vriendelijke groet,\nWouter Arts\nRecruitin B.V.\n06-14314593\nwarts@recruitin.nl`,
      };
      break;

    case "recruitin_pitch": {
      const scarcity = getScarcity(args.sector);
      const fees = calcFees(args.salaryMin, args.salaryMax, args.bonus || 0);
      result = {
        vacancy: { title: args.jobTitle, company: args.company, salary: { min: args.salaryMin, max: args.salaryMax } },
        laborMarket: { scarcity, regions: REGIONS, source: 'UWV 2025' },
        fees,
        timeline: TIMELINES[args.timeline || 'standard'],
        targets: TARGETS[args.sector.toLowerCase()] || [],
        successRate: '85%',
      };
      break;
    }

    case "recruitin_workflow": {
      const scarcity = getScarcity(args.sector);
      const fees = calcFees(args.salaryMin, args.salaryMax, args.bonus || 0);
      const firstName = (args.contactName || 'Contactpersoon').split(' ')[0];
      
      result = {
        laborMarket: { scarcity, regions: REGIONS },
        fees,
        email: {
          subject: `Vacature ${args.jobTitle} - Recruitin kan helpen`,
          body: `Beste ${firstName},\n\nIk zag dat ${args.company} op zoek is naar een ${args.jobTitle}.\n\nMet ${scarcity}% krapte in jullie sector begrijp ik dat dit een uitdaging kan zijn.\n\nRecruitin is gespecialiseerd in technisch recruitment.\n\nKan ik je deze week bellen?\n\nMet vriendelijke groet,\nWouter Arts\n06-14314593\nwarts@recruitin.nl`,
        },
        pitch: {
          timeline: TIMELINES[args.timeline || 'standard'],
          targets: TARGETS[args.sector.toLowerCase()] || [],
        },
        pipedrive: null,
      };

      if (args.createPipedrive && apiKey) {
        const existingOrg = await pipedriveSearch(apiKey, 'organizations', args.company);
        const existingPerson = args.contactEmail ? await pipedriveSearch(apiKey, 'persons', args.contactEmail) : null;
        
        const orgId = existingOrg || await pipedriveCreate(apiKey, 'organizations', { name: args.company });
        const personId = existingPerson || (args.contactName ? await pipedriveCreate(apiKey, 'persons', {
          name: args.contactName,
          email: args.contactEmail ? [{ value: args.contactEmail, primary: true }] : undefined,
          org_id: orgId,
        }) : null);
        const dealId = await pipedriveCreate(apiKey, 'deals', {
          title: `${args.jobTitle} - ${args.company}`,
          value: fees.retainer.min,
          currency: 'EUR',
          person_id: personId,
          org_id: orgId,
        });
        result.pipedrive = { orgId, personId, dealId };
      }
      break;
    }

    default:
      return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
  }

  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Recruitin Sales MCP running");
