const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const server = new Server({
  name: 'resend-email',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {}
  }
});

// Define available tools
const tools = [
  {
    name: 'send_email',
    description: 'Send an email using Resend',
    inputSchema: {
      type: 'object',
      properties: {
        to: {
          type: 'array',
          items: { type: 'string' },
          description: 'Email recipients'
        },
        from: {
          type: 'string',
          description: 'Sender email address'
        },
        subject: {
          type: 'string',
          description: 'Email subject'
        },
        html: {
          type: 'string',
          description: 'HTML email content'
        },
        text: {
          type: 'string',
          description: 'Plain text email content'
        },
        reply_to: {
          type: 'string',
          description: 'Reply-to email address'
        }
      },
      required: ['to', 'from', 'subject']
    }
  }
];

// Handle list_tools request
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools
}));

// Handle call_tool request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name: toolName, arguments: args } = request.params;

  if (toolName === 'send_email') {
    try {
      const { data, error } = await resend.emails.send({
        from: args.from,
        to: args.to,
        subject: args.subject,
        html: args.html || undefined,
        text: args.text || undefined,
        reply_to: args.reply_to || undefined
      });

      if (error) {
        return {
          content: [{ type: 'text', text: `Error sending email: ${error.message}` }]
        };
      }

      return {
        content: [{ type: 'text', text: `Email sent successfully! ID: ${data.id}` }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error: ${error.message}` }]
      };
    }
  }

  throw new Error(`Unknown tool: ${toolName}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);