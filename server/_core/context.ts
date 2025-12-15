import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema-pg";
import { sdk } from "./sdk";

// Demo user for testing without database
const DEMO_USER = {
  id: 1,
  openId: "demo-user",
  name: "Sulaiman Alkaabi",
  email: "s.binkaab@gmail.com",
  role: "super_admin" as const,
  tenantId: 1,
  loginMethod: "demo",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: (User & { tenantId?: number }) | null;
  tenantId: number;
  isDemoMode: boolean;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: (User & { tenantId?: number }) | null = null;
  
  // Check for demo mode via cookie
  const isDemoMode = opts.req.cookies?.['kafaat-demo-mode'] === 'true' || 
                     opts.req.headers['x-demo-mode'] === 'true';

  if (isDemoMode) {
    // Return demo user without authentication
    user = DEMO_USER as any;
  } else {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch (error) {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  // Default tenant ID for now - in production this would come from user or subdomain
  const tenantId = (user as any)?.tenantId ?? 1;

  return {
    req: opts.req,
    res: opts.res,
    user,
    tenantId,
    isDemoMode,
  };
}
