# =============================================================================
# KAFAAT 1.0 - PRODUCTION DOCKERFILE
# Multi-stage build for optimized production image
# =============================================================================

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS production

WORKDIR /app

# Install only production dependencies PLUS vite, drizzle-kit, and typescript (needed at runtime for server and migrations)
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps && \
    npm install vite drizzle-kit typescript tsx esbuild --legacy-peer-deps

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Create uploads directory
RUN mkdir -p /app/uploads && chown -R nodejs:nodejs /app/uploads

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application with migrations
CMD ["sh", "-c", "npx drizzle-kit push --force || echo 'Migration warning, continuing...' && node dist/index.js"]
