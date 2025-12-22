# Airtable MCP Server

An MCP (Model Context Protocol) server for integrating with Airtable's API, enabling AI assistants to interact with Airtable bases, tables, and records.

## Features

- List and access Airtable bases
- Create, read, update, and delete records
- Query and filter data
- Manage table schemas
- Batch operations support

## Installation

```bash
npm install
```

## Configuration

Set the following environment variables:

```bash
AIRTABLE_API_KEY=your_api_key_here
AIRTABLE_BASE_ID=your_base_id_here
```

## Usage

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "airtable": {
      "command": "node",
      "args": ["/path/to/airtable-mcp-server.js"],
      "env": {
        "AIRTABLE_API_KEY": "your_api_key",
        "AIRTABLE_BASE_ID": "your_base_id"
      }
    }
  }
}
```

## Available Tools

- `listBases` - List all available Airtable bases
- `listTables` - List tables in a base
- `getRecords` - Retrieve records from a table
- `createRecord` - Create a new record
- `updateRecord` - Update an existing record
- `deleteRecord` - Delete a record
- `queryRecords` - Query records with filters

## License

MIT