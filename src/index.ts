#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import mysql from "mysql2/promise";

// MySQL bağlantı konfigürasyonu
const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  port: parseInt(process.env.DB_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// MySQL connection pool
const pool = mysql.createPool(DB_CONFIG);

// MCP Server oluştur
const server = new Server(
  {
    name: "mysql-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Helper function - MySQL query çalıştır
async function executeQuery(sql: string): Promise<any> {
  try {
    const [rows, fields] = await pool.execute(sql);
    return {
      success: true,
      rows: rows,
      fields: fields.map((f: any) => ({
        name: f.name,
        type: f.type,
        table: f.table
      })),
      rowCount: Array.isArray(rows) ? rows.length : 1
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

// Tools listesini döndür
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "mysql_query",
        description: "Execute any MySQL query and return results",
        inputSchema: {
          type: "object",
          properties: {
            sql: {
              type: "string",
              description: "SQL query to execute (SELECT, INSERT, UPDATE, DELETE, etc.)"
            }
          },
          required: ["sql"]
        }
      },
      {
        name: "mysql_databases",
        description: "List all databases",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      {
        name: "mysql_tables", 
        description: "List all tables in a database",
        inputSchema: {
          type: "object",
          properties: {
            database: {
              type: "string",
              description: "Database name (optional, uses current if not specified)"
            }
          },
          required: []
        }
      },
      {
        name: "mysql_describe",
        description: "Describe table structure",
        inputSchema: {
          type: "object",
          properties: {
            table: {
              type: "string", 
              description: "Table name to describe"
            },
            database: {
              type: "string",
              description: "Database name (optional)"
            }
          },
          required: ["table"]
        }
      }
    ]
  };
});

// Tool çağrılarını handle et
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "mysql_query": {
        const { sql } = args as { sql: string };
        const result = await executeQuery(sql);
        
        if (result.success) {
          return {
            content: [
              {
                type: "text",
                text: `Query executed successfully!\n\nSQL: ${sql}\n\nResults (${result.rowCount} rows):\n${JSON.stringify(result.rows, null, 2)}`
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: "text", 
                text: `Query failed!\n\nSQL: ${sql}\n\nError: ${result.error}\nCode: ${result.code}`
              }
            ]
          };
        }
      }

      case "mysql_databases": {
        const result = await executeQuery("SHOW DATABASES");
        
        if (result.success) {
          const databases = result.rows.map((row: any) => Object.values(row)[0]);
          return {
            content: [
              {
                type: "text",
                text: `Databases:\n${databases.map((db: any) => `• ${db}`).join('\n')}`
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `Error listing databases: ${result.error}`
              }
            ]
          };
        }
      }

      case "mysql_tables": {
        const { database } = args as { database?: string };
        const sql = database ? `SHOW TABLES FROM ${database}` : "SHOW TABLES";
        const result = await executeQuery(sql);
        
        if (result.success) {
          const tables = result.rows.map((row: any) => Object.values(row)[0]);
          return {
            content: [
              {
                type: "text",
                text: `Tables${database ? ` in ${database}` : ''}:\n${tables.map((table: any) => `• ${table}`).join('\n')}`
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `Error listing tables: ${result.error}`
              }
            ]
          };
        }
      }

      case "mysql_describe": {
        const { table, database } = args as { table: string; database?: string };
        const tableName = database ? `${database}.${table}` : table;
        const result = await executeQuery(`DESCRIBE ${tableName}`);
        
        if (result.success) {
          return {
            content: [
              {
                type: "text",
                text: `Table structure for ${tableName}:\n\n${JSON.stringify(result.rows, null, 2)}`
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `Error describing table ${tableName}: ${result.error}`
              }
            ]
          };
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Tool execution error: ${error.message}`
        }
      ]
    };
  }
});

// Server'ı başlat
async function main() {
  // Test database connection (optional for deployment environments)
  const skipDbTest = process.env.SKIP_DB_TEST === 'true';
  
  if (!skipDbTest) {
    try {
      const connection = await pool.getConnection();
      console.error("✅ MySQL connection successful");
      connection.release();
    } catch (error) {
      console.error("❌ MySQL connection failed:", error);
      console.error("ℹ️ Set SKIP_DB_TEST=true to skip connection test");
      process.exit(1);
    }
  } else {
    console.error("⚠️ Skipping database connection test (deployment mode)");
  }

  // Start MCP server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🚀 MySQL MCP Server running on stdio");
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.error('\n🛑 Shutting down MySQL MCP Server...');
  await pool.end();
  process.exit(0);
});

// Start server
main().catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
}); 