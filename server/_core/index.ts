import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerAzureADRoutes } from "../auth/azure-ad";
import { registerMarketplaceRoutes } from "../marketplace/azure-marketplace";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { trialService } from "../services/trial.service";

// Application start time for uptime calculation
const startTime = Date.now();

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Security middleware (production)
  if (process.env.NODE_ENV === "production") {
    app.use(helmet({
      contentSecurityPolicy: false, // Disabled for SPA compatibility
    }));
  }
  
  // CORS configuration
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000",
    "http://localhost:5173",
  ];
  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
  }));
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser());
  
  // Request logging
  app.use((req, _res, next) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
  });
  
  // Health check endpoint (required for Azure Marketplace & App Service)
  app.get("/health", (_req, res) => {
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    res.status(200).json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      uptime: `${uptime}s`,
      environment: process.env.NODE_ENV || "development",
      features: {
        multiTenancy: process.env.FEATURE_MULTI_TENANCY === "true",
        aiRecommendations: process.env.FEATURE_AI_RECOMMENDATIONS === "true",
        psychometricAssessments: process.env.FEATURE_PSYCHOMETRIC_ASSESSMENTS === "true",
        tdraCompliance: process.env.TDRA_COMPLIANCE_ENABLED === "true",
      }
    });
  });
  
  // Readiness probe (for Kubernetes/Azure Container Apps)
  app.get("/ready", async (_req, res) => {
    try {
      // Could add database connectivity check here
      res.status(200).json({ ready: true });
    } catch {
      res.status(503).json({ ready: false });
    }
  });
  
  // Metrics endpoint (basic)
  app.get("/metrics", (_req, res) => {
    const memUsage = process.memoryUsage();
    res.json({
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + "MB",
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + "MB",
        rss: Math.round(memUsage.rss / 1024 / 1024) + "MB",
      },
      cpu: process.cpuUsage(),
    });
  });
  
  // OAuth callback under /api/oauth/callback (legacy Manus auth)
  registerOAuthRoutes(app);
  
  // Azure AD / Entra ID SSO routes
  registerAzureADRoutes(app);
  
  // Azure Marketplace integration routes
  registerMarketplaceRoutes(app);
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`🚀 Kafaat TMS Server running on http://localhost:${port}/`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log(`🔐 Azure AD SSO: http://localhost:${port}/api/auth/azure/login`);
    console.log(`🏪 Marketplace: http://localhost:${port}/api/marketplace/landing`);
    console.log(`📝 Signup: http://localhost:${port}/signup`);
    console.log(`💰 Pricing: http://localhost:${port}/pricing`);
    
    // Start the trial expiration monitoring service
    trialService.start();
    console.log(`⏰ Trial expiration monitor started`);
  });
}

startServer().catch(console.error);
