#!/usr/bin/env node

/**
 * Ollama MCP Server - Local LLM for Recruitment
 *
 * Tools:
 * - ollama_generate: Free-form text generation
 * - ollama_summarize: Summarize articles/CVs/job descriptions
 * - ollama_translate: Translate recruitment content (NL<>EN)
 * - ollama_extract_keywords: Extract skills/keywords from text
 * - ollama_score_match: Score candidate-vacancy match locally
 * - ollama_list_models: List available local models
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const DEFAULT_MODEL = process.env.OLLAMA_DEFAULT_MODEL || "llama3.2";

async function ollamaGenerate(model, prompt, system) {
  const body = { model, prompt, stream: false };
  if (system) body.system = system;

  const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.response;
}

async function ollamaListModels() {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
  if (!res.ok) throw new Error(`Ollama error ${res.status}`);
  const data = await res.json();
  return data.models || [];
}

const server = new Server(
  { name: "ollama-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "ollama_generate",
      description:
        "Generate text using a local Ollama model. Use for any free-form LLM task without sending data to external APIs.",
      inputSchema: {
        type: "object",
        properties: {
          prompt: { type: "string", description: "The prompt" },
          model: {
            type: "string",
            description: `Model name (default: ${DEFAULT_MODEL})`,
          },
          system: {
            type: "string",
            description: "Optional system prompt",
          },
        },
        required: ["prompt"],
      },
    },
    {
      name: "ollama_summarize",
      description:
        "Summarize text locally (articles, CVs, job descriptions, company profiles). Privacy-safe - no data leaves your machine.",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string", description: "Text to summarize" },
          language: {
            type: "string",
            enum: ["nl", "en"],
            description: "Output language (default: nl)",
          },
          max_sentences: {
            type: "number",
            description: "Max sentences in summary (default: 5)",
          },
        },
        required: ["text"],
      },
    },
    {
      name: "ollama_translate",
      description:
        "Translate recruitment content between Dutch and English locally.",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string", description: "Text to translate" },
          from: {
            type: "string",
            enum: ["nl", "en"],
            description: "Source language",
          },
          to: {
            type: "string",
            enum: ["nl", "en"],
            description: "Target language",
          },
        },
        required: ["text", "from", "to"],
      },
    },
    {
      name: "ollama_extract_keywords",
      description:
        "Extract skills, technologies, and keywords from CVs, job descriptions, or company profiles. Returns structured JSON.",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string", description: "Text to analyze" },
          type: {
            type: "string",
            enum: ["cv", "vacancy", "company", "article"],
            description: "Type of content",
          },
        },
        required: ["text"],
      },
    },
    {
      name: "ollama_score_match",
      description:
        "Score how well a candidate matches a vacancy based on skills, experience, and requirements. Returns 0-100 score with explanation.",
      inputSchema: {
        type: "object",
        properties: {
          candidate: {
            type: "string",
            description: "Candidate CV or profile text",
          },
          vacancy: {
            type: "string",
            description: "Job description text",
          },
        },
        required: ["candidate", "vacancy"],
      },
    },
    {
      name: "ollama_list_models",
      description: "List all locally available Ollama models.",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  const model = args.model || DEFAULT_MODEL;

  try {
    switch (name) {
      case "ollama_generate": {
        const response = await ollamaGenerate(model, args.prompt, args.system);
        return { content: [{ type: "text", text: response }] };
      }

      case "ollama_summarize": {
        const lang = args.language || "nl";
        const maxSentences = args.max_sentences || 5;
        const system =
          lang === "nl"
            ? `Je bent een recruitment expert. Maak een beknopte samenvatting in maximaal ${maxSentences} zinnen in het Nederlands.`
            : `You are a recruitment expert. Create a concise summary in max ${maxSentences} sentences in English.`;
        const response = await ollamaGenerate(
          model,
          `Summarize:\n\n${args.text}`,
          system
        );
        return { content: [{ type: "text", text: response }] };
      }

      case "ollama_translate": {
        const langNames = { nl: "Dutch", en: "English" };
        const system = `You are a professional translator specializing in recruitment and HR terminology. Translate accurately from ${langNames[args.from]} to ${langNames[args.to]}. Only return the translation, nothing else.`;
        const response = await ollamaGenerate(
          model,
          `Translate:\n\n${args.text}`,
          system
        );
        return { content: [{ type: "text", text: response }] };
      }

      case "ollama_extract_keywords": {
        const typeContext = {
          cv: "a candidate CV/resume",
          vacancy: "a job vacancy/description",
          company: "a company profile",
          article: "a recruitment industry article",
        };
        const context = typeContext[args.type] || "recruitment content";
        const system = `You are a recruitment data analyst. Extract structured information from ${context}. Return valid JSON with these keys: skills (array), technologies (array), experience_years (number or null), education_level (string or null), languages (array), certifications (array), key_requirements (array). Only return JSON.`;
        const response = await ollamaGenerate(
          model,
          `Extract keywords and structured data:\n\n${args.text}`,
          system
        );
        return { content: [{ type: "text", text: response }] };
      }

      case "ollama_score_match": {
        const system = `You are an expert recruitment matcher. Score how well the candidate matches the vacancy on a scale of 0-100. Return valid JSON with: score (number 0-100), strengths (array of matching points), gaps (array of missing requirements), recommendation (string: "strong match", "potential match", "weak match", or "no match").`;
        const prompt = `CANDIDATE:\n${args.candidate}\n\nVACANCY:\n${args.vacancy}\n\nScore this match:`;
        const response = await ollamaGenerate(model, prompt, system);
        return { content: [{ type: "text", text: response }] };
      }

      case "ollama_list_models": {
        const models = await ollamaListModels();
        const formatted = models
          .map(
            (m) =>
              `${m.name} (${(m.size / 1e9).toFixed(1)}GB, ${m.details?.parameter_size || "?"})`
          )
          .join("\n");
        return {
          content: [
            {
              type: "text",
              text: formatted || "No models found. Run: ollama pull llama3.2",
            },
          ],
        };
      }

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    const isConnectionError =
      error.cause?.code === "ECONNREFUSED" ||
      error.message.includes("ECONNREFUSED");
    const hint = isConnectionError
      ? "\n\nIs Ollama running? Start it with: ollama serve"
      : "";
    return {
      content: [{ type: "text", text: `Error: ${error.message}${hint}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Ollama MCP server running (${OLLAMA_BASE_URL}, model: ${DEFAULT_MODEL})`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
