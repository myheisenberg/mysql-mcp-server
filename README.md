# 🔧 MySQL MCP Server

A Model Context Protocol (MCP) server for MySQL database operations. Provides 4 powerful tools for database interaction through any MCP-compatible client.

## ✨ Features

- **🔍 Execute SQL Queries** - Run any SELECT, INSERT, UPDATE, DELETE commands
- **📊 List Databases** - View all available databases
- **📋 List Tables** - Show tables in any database
- **🏗️ Describe Tables** - Get detailed table structure information
- **🔒 Secure** - Environment-based configuration, no hardcoded credentials
- **⚡ Fast** - Built with TypeScript and connection pooling

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mysql-mcp-server.git
cd mysql-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

### Configuration

The server uses environment variables for database configuration:

```bash
DB_HOST=localhost        # MySQL host (default: localhost)
DB_USER=root            # MySQL username (default: root)
DB_PASSWORD=            # MySQL password (default: empty)
DB_PORT=3306           # MySQL port (default: 3306)
```

## 📖 Usage

### With Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mysql": {
      "command": "node",
      "args": ["path/to/mysql-mcp-server/dist/index.js"],
      "env": {
        "DB_HOST": "localhost",
        "DB_USER": "your_username",
        "DB_PASSWORD": "your_password",
        "DB_PORT": "3306"
      }
    }
  }
}
```

### With Cursor IDE

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "mysql": {
      "command": "node",
      "args": ["path/to/mysql-mcp-server/dist/index.js"],
      "env": {
        "DB_HOST": "localhost",
        "DB_USER": "your_username", 
        "DB_PASSWORD": "your_password",
        "DB_PORT": "3306"
      }
    }
  }
}
```

## 🛠️ Available Tools

### 1. `mysql_query`
Execute any MySQL query and get formatted results.

**Example:** "Run a SELECT query on the users table"

### 2. `mysql_databases`
List all available databases on the MySQL server.

**Example:** "Show me all databases"

### 3. `mysql_tables`
List all tables in a specific database.

**Example:** "What tables are in the blog database?"

### 4. `mysql_describe`
Get detailed information about a table's structure.

**Example:** "Describe the structure of the users table"

## 🔧 Development

```bash
# Install dependencies
npm install

# Development mode (watch for changes)
npm run dev

# Build for production
npm run build

# Start the server
npm start
```

## 📦 Project Structure

```
mysql-mcp-server/
├── src/
│   └── index.ts          # Main MCP server implementation
├── dist/                 # Compiled JavaScript (auto-generated)
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## 🔒 Security

- **No hardcoded credentials** - All database connection details come from environment variables
- **Connection pooling** - Efficient and secure database connections
- **Error handling** - Proper error messages without exposing sensitive information

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with the [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- Uses [mysql2](https://github.com/sidorares/node-mysql2) for MySQL connectivity
- Inspired by the MCP community

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/mysql-mcp-server/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide as much detail as possible including error messages and configuration

---

**Made with ❤️ for the MCP community** 