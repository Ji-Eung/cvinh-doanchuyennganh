# Multi-stage build for OldMarket API
# Base builder stage
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies (include dev for build)
COPY package*.json ./
RUN npm ci

# Copy source
COPY tsconfig.json ./
COPY openapi.yaml ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Production runtime image
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy package manifests and install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built dist and OpenAPI spec
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/openapi.yaml ./openapi.yaml

# Expose port
EXPOSE 8080

# Health metadata (optional)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
 CMD node -e "fetch('http://localhost:8080/health').then(r=>{if(r.status!==200)process.exit(1)}).catch(()=>process.exit(1))"

# Start command
CMD ["node","dist/server.js"]
