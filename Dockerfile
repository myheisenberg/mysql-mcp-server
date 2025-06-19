FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Set environment variable to skip database test in container
ENV SKIP_DB_TEST=true

# Expose port (if needed for future HTTP transport)
EXPOSE 3000

# Start the MCP server
CMD ["node", "dist/index.js"] 