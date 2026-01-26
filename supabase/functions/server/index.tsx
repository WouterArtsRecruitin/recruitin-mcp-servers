import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-ca13d8c1/health", (c) => {
  return c.json({ status: "ok" });
});

// Notion API proxy endpoint
app.post("/make-server-ca13d8c1/notion/push", async (c) => {
  try {
    const body = await c.req.json();
    const { databaseId, apiKey, article, category } = body;

    // Use API key from request body (user-provided) or fallback to environment variable
    const notionApiKey = apiKey || Deno.env.get('NOTION_API_KEY');
    
    if (!notionApiKey) {
      console.error('No API key provided in request and NOTION_API_KEY environment variable not set');
      return c.json({ 
        success: false, 
        message: 'Geen API key geconfigureerd. Voeg je Notion API key toe in de Notion Setup.' 
      }, 400);
    }

    // Validate required fields
    if (!databaseId || !article) {
      return c.json({ 
        success: false, 
        message: 'Missing required fields: databaseId or article' 
      }, 400);
    }

    // Convert Dutch date format to ISO 8601
    const convertDateToISO = (dutchDate: string): string | null => {
      if (!dutchDate) return null;
      
      try {
        // Map Dutch month abbreviations to numbers
        const monthMap: Record<string, string> = {
          'jan': '01', 'feb': '02', 'mrt': '03', 'apr': '04',
          'mei': '05', 'jun': '06', 'jul': '07', 'aug': '08',
          'sep': '09', 'okt': '10', 'nov': '11', 'dec': '12'
        };
        
        // Parse format: "9 jan 2026"
        const parts = dutchDate.trim().toLowerCase().split(' ');
        if (parts.length === 3) {
          const day = parts[0].padStart(2, '0');
          const month = monthMap[parts[1]];
          const year = parts[2];
          
          if (month && year) {
            return `${year}-${month}-${day}`;
          }
        }
        
        // If already in ISO format or other format, return as is
        if (dutchDate.match(/^\\d{4}-\\d{2}-\\d{2}$/)) {
          return dutchDate;
        }
        
        return null;
      } catch (error) {
        console.error('Date conversion error:', error);
        return null;
      }
    };

    // Convert date if present
    const isoDate = article.date ? convertDateToISO(article.date) : null;

    // Build properties: Title (required) + URL (if property exists in database)
    const properties: any = {
      // Title is required in all Notion databases
      title: {
        title: [
          {
            text: {
              content: article.title || 'Untitled',
            },
          },
        ],
      },
    };

    // Add URL if provided - make sure you have a "URL" property in your Notion database
    if (article.url) {
      properties.URL = {
        url: article.url,
      };
    }

    console.log('Pushing to Notion:', {
      title: article.title,
      url: article.url,
      category: category,
      databaseId: databaseId
    });

    // Call Notion API
    const notionResponse = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionApiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: {
          database_id: databaseId,
        },
        properties,
      }),
    });

    if (!notionResponse.ok) {
      const errorData = await notionResponse.json();
      console.error('Notion API Error:', errorData);
      
      // Handle specific errors
      if (notionResponse.status === 401) {
        return c.json({ 
          success: false, 
          message: 'Ongeldige API key. Neem contact op met de beheerder.' 
        }, 401);
      } else if (notionResponse.status === 404) {
        return c.json({ 
          success: false, 
          message: 'Database niet gevonden. Controleer je database ID en zorg dat de integratie toegang heeft.' 
        }, 404);
      } else if (notionResponse.status === 400) {
        return c.json({ 
          success: false, 
          message: `Notion fout: ${errorData.message || 'Database properties komen niet overeen'}` 
        }, 400);
      }
      
      return c.json({ 
        success: false, 
        message: `Fout bij opslaan naar Notion (${notionResponse.status})` 
      }, notionResponse.status);
    }

    const notionData = await notionResponse.json();
    
    return c.json({ 
      success: true, 
      message: 'Artikel succesvol opgeslagen in Notion!',
      data: notionData
    });

  } catch (error) {
    console.error('Error in Notion proxy:', error);
    return c.json({ 
      success: false, 
      message: `Server fout: ${error.message}` 
    }, 500);
  }
});

Deno.serve(app.fetch);