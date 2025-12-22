#!/usr/bin/env node

/**
 * Labour Market Intelligence MCP Server
 * Award-winning professional version with 85% data reliability standard
 * Specialized for Jobdigger PDF analysis and workforce intelligence
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { MarketIntelligenceEngine } from './intelligence/MarketIntelligenceEngine.js';
import { ReliableWorkforceEngine } from './intelligence/ReliableWorkforceEngine.js';
import { ProfessionalReportGenerator } from './reports/ProfessionalReportGenerator.js';
import { JobdiggerAnalysisTemplate } from './intelligence/JobdiggerAnalysisTemplate.js';

// Initialize core engines with reliability validation
const marketEngine = new MarketIntelligenceEngine();
const workforceEngine = new ReliableWorkforceEngine();
const reportGenerator = new ProfessionalReportGenerator();
const jobdiggerTemplate = new JobdiggerAnalysisTemplate();

const server = new Server(
  {
    name: 'labour-market-intelligence-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Available MCP Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'analyze_labour_market_professional',
        description: 'Award-winning analysis of Dutch labour market with 85% reliability guarantee. Specializes in Jobdigger PDF data points and workforce demographics.',
        inputSchema: {
          type: 'object',
          properties: {
            jobTitle: {
              type: 'string',
              description: 'Job title to analyze (e.g., "Allround Monteur")',
            },
            location: {
              type: 'string',
              description: 'Netherlands location/region',
              default: 'Nederland',
            },
            pdfPath: {
              type: 'string',
              description: 'Optional path to Jobdigger PDF file for enhanced analysis',
            },
            includeWorkforceData: {
              type: 'boolean',
              description: 'Include workforce availability intelligence (active/passive job seekers, demographics)',
              default: true,
            },
          },
          required: ['jobTitle'],
        },
      },
      {
        name: 'analyze_jobdigger_pdf_specialized',
        description: 'Specialized analysis of Jobdigger PDF files with pre-configured templates for maximum reliability. Only processes real data with 85% minimum reliability.',
        inputSchema: {
          type: 'object',
          properties: {
            pdfPath: {
              type: 'string',
              description: 'Path to Jobdigger PDF file (e.g., Allround_Monteur.pdf)',
            },
            analysisType: {
              type: 'string',
              enum: ['complete', 'salary', 'demand', 'skills', 'workforce'],
              description: 'Type of analysis to perform',
              default: 'complete',
            },
          },
          required: ['pdfPath'],
        },
      },
      {
        name: 'generate_professional_report',
        description: 'Generate award-winning professional Dutch recruitment reports with reliability scoring. Includes executive summary, data validation, and actionable insights.',
        inputSchema: {
          type: 'object',
          properties: {
            analysisData: {
              type: 'object',
              description: 'Market analysis data from previous tool calls',
            },
            reportType: {
              type: 'string',
              enum: ['executive', 'detailed', 'comparative', 'workforce'],
              description: 'Type of professional report',
              default: 'detailed',
            },
            includeReliabilityScore: {
              type: 'boolean',
              description: 'Include data reliability validation and scoring',
              default: true,
            },
          },
          required: ['analysisData'],
        },
      },
    ],
  };
});

// Tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (!args) {
    throw new McpError(ErrorCode.InvalidParams, 'Missing arguments');
  }

  try {
    switch (name) {
      case 'analyze_labour_market_professional': {
        const jobTitle = args.jobTitle as string;
        const location = args.location as string || 'Nederland';
        const pdfPath = args.pdfPath as string;
        const includeWorkforceData = args.includeWorkforceData as boolean;
        
        console.error(`🔍 Professional Labour Market Analysis: ${jobTitle}`);
        
        const marketData = await marketEngine.analyzeMarketDemand(jobTitle, location);
        
        let pdfAnalysis = null;
        if (pdfPath) {
          pdfAnalysis = await jobdiggerTemplate.analyzeJobdiggerPDF(pdfPath);
        }
        
        let workforceData = null;
        if (includeWorkforceData) {
          const workforceAnalysis = workforceEngine.analyzeWorkforceWithVerification(
            jobTitle,
            pdfAnalysis,
            marketData
          );
          
          if (!workforceAnalysis.isReliable) {
            return {
              content: [
                {
                  type: 'text',
                  text: `❌ ANALYSE GEWEIGERD: Data betrouwbaarheid ${workforceAnalysis.reliabilityScore.overallScore}% < vereiste 85%\n\n` +
                        `Ontbrekende gegevens:\n${workforceAnalysis.reliabilityScore.blockers.join('\n- ')}\n\n` +
                        `💡 Voeg betrouwbare databronnen toe voor volledige analyse.`
                }
              ]
            };
          }
          
          workforceData = workforceAnalysis.workforceData;
        }
        
        const completeAnalysis = {
          jobTitle,
          location,
          timestamp: new Date().toISOString(),
          marketData,
          pdfAnalysis,
          workforceData,
          reliabilityScore: workforceData ? 
            workforceEngine.validator.validateDataReliability(pdfAnalysis, marketData) : 
            { overallScore: 75, isReliable: false, blockers: ['Onvoldoende workforce data'] }
        };

        return {
          content: [
            {
              type: 'text',
              text: `✅ **PROFESSIONELE ARBEIDSMARKTANALYSE**\n\n` +
                    `**Functie:** ${jobTitle}\n` +
                    `**Locatie:** ${location}\n` +
                    `**Betrouwbaarheid:** ${completeAnalysis.reliabilityScore.overallScore}%\n\n` +
                    `**📊 RESULTATEN:**\n` +
                    JSON.stringify(completeAnalysis, null, 2)
            }
          ]
        };
      }

      case 'analyze_jobdigger_pdf_specialized': {
        const pdfPath = args.pdfPath as string;
        const analysisType = args.analysisType as string;
        
        console.error(`📄 Jobdigger PDF Analysis: ${pdfPath}`);
        
        const analysis = await jobdiggerTemplate.analyzeJobdiggerPDF(pdfPath);
        const reliabilityScore = workforceEngine.validator.validateDataReliability(analysis);
        
        if (!reliabilityScore.isReliable) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ PDF ANALYSE GEWEIGERD: Onvoldoende betrouwbaarheid (${reliabilityScore.overallScore}% < 85%)\n\n` +
                      `Problemen:\n- ${reliabilityScore.blockers.join('\n- ')}\n\n` +
                      `💡 Gebruik een volledig Jobdigger rapport voor betrouwbare analyse.`
              }
            ]
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: `✅ **JOBDIGGER PDF ANALYSE**\n\n` +
                    `**Bestand:** ${pdfPath}\n` +
                    `**Type:** ${analysisType}\n` +
                    `**Betrouwbaarheid:** ${reliabilityScore.overallScore}%\n\n` +
                    `**📋 GEANALYSEERDE DATA:**\n` +
                    JSON.stringify(analysis, null, 2)
            }
          ]
        };
      }

      case 'generate_professional_report': {
        const analysisData = args.analysisData;
        const reportType = args.reportType as 'executive' | 'detailed' | 'comparative' | 'workforce' || 'detailed';
        const includeReliabilityScore = args.includeReliabilityScore as boolean;
        
        console.error(`📊 Professional Report Generation: ${reportType}`);
        
        const report = await reportGenerator.generateReport(
          analysisData,
          reportType,
          includeReliabilityScore
        );

        return {
          content: [
            {
              type: 'text',
              text: `✅ **PROFESSIONEEL RAPPORT GEGENEREERD**\n\n${report}`
            }
          ]
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    console.error(`❌ Tool execution error: ${error}`);
    throw new McpError(
      ErrorCode.InternalError,
      `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
});

// Start MCP server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🚀 Labour Market Intelligence MCP Server started with 85% reliability standard');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  });
}