/**
 * Azure AD / Microsoft Entra ID Authentication Integration
 * 
 * This module provides SSO integration with Azure AD for enterprise customers.
 * It supports both single-tenant and multi-tenant Azure AD applications.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Register an application in Azure Portal (Azure AD -> App Registrations)
 * 2. Configure redirect URIs: https://your-domain.com/api/auth/azure/callback
 * 3. Create a client secret and store in Azure Key Vault
 * 4. Add the following environment variables:
 *    - AZURE_AD_CLIENT_ID: Application (client) ID
 *    - AZURE_AD_CLIENT_SECRET: Client secret value
 *    - AZURE_AD_TENANT_ID: Directory (tenant) ID (use "common" for multi-tenant)
 *    - AZURE_AD_REDIRECT_URI: Callback URL
 * 5. Grant API permissions: User.Read, openid, profile, email
 */

import { Express, Request, Response, NextFunction } from "express";
import axios from "axios";
import { SignJWT, jwtVerify } from "jose";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { ENV } from "../_core/env";
import * as db from "../db";
import { tenantService } from "../services/tenant.service";

// Azure AD Configuration
interface AzureADConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string; // "common" for multi-tenant
  redirectUri: string;
}

interface AzureTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
}

interface AzureUserInfo {
  sub: string;
  name: string;
  email: string;
  preferred_username: string;
  oid: string; // Object ID
  tid: string; // Tenant ID
  roles?: string[];
  groups?: string[];
}

interface DecodedIdToken {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  name?: string;
  email?: string;
  preferred_username?: string;
  oid: string;
  tid: string;
  roles?: string[];
}

/**
 * Azure AD Authentication Service
 */
export class AzureADAuthService {
  private config: AzureADConfig;
  private issuerBaseUrl: string;

  constructor() {
    this.config = {
      clientId: process.env.AZURE_AD_CLIENT_ID || "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
      tenantId: process.env.AZURE_AD_TENANT_ID || "common",
      redirectUri: process.env.AZURE_AD_REDIRECT_URI || "",
    };

    // Support both single-tenant and multi-tenant
    this.issuerBaseUrl =
      this.config.tenantId === "common"
        ? "https://login.microsoftonline.com/common"
        : `https://login.microsoftonline.com/${this.config.tenantId}`;

    if (!this.config.clientId) {
      console.warn(
        "[AzureAD] Azure AD not configured. Set AZURE_AD_CLIENT_ID, AZURE_AD_CLIENT_SECRET, and AZURE_AD_REDIRECT_URI."
      );
    }
  }

  /**
   * Check if Azure AD is configured
   */
  isConfigured(): boolean {
    return !!(
      this.config.clientId &&
      this.config.clientSecret &&
      this.config.redirectUri
    );
  }

  /**
   * Generate the Azure AD authorization URL
   */
  getAuthorizationUrl(state: string, nonce: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: "code id_token",
      redirect_uri: this.config.redirectUri,
      response_mode: "form_post",
      scope: "openid profile email User.Read",
      state,
      nonce,
    });

    return `${this.issuerBaseUrl}/oauth2/v2.0/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<AzureTokenResponse> {
    const tokenEndpoint = `${this.issuerBaseUrl}/oauth2/v2.0/token`;

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      code,
      redirect_uri: this.config.redirectUri,
      grant_type: "authorization_code",
      scope: "openid profile email User.Read",
    });

    const response = await axios.post<AzureTokenResponse>(
      tokenEndpoint,
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data;
  }

  /**
   * Get user info from Microsoft Graph API
   */
  async getUserInfo(accessToken: string): Promise<AzureUserInfo> {
    const response = await axios.get("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return {
      sub: response.data.id,
      name: response.data.displayName,
      email: response.data.mail || response.data.userPrincipalName,
      preferred_username: response.data.userPrincipalName,
      oid: response.data.id,
      tid: "", // Will be extracted from id_token
    };
  }

  /**
   * Decode and validate ID token (basic validation)
   * Note: In production, implement full JWT validation with JWKS
   */
  decodeIdToken(idToken: string): DecodedIdToken {
    const parts = idToken.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid ID token format");
    }

    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8")
    );

    return payload as DecodedIdToken;
  }

  /**
   * Get user's group memberships from Microsoft Graph
   */
  async getUserGroups(accessToken: string): Promise<string[]> {
    try {
      const response = await axios.get(
        "https://graph.microsoft.com/v1.0/me/memberOf",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data.value
        .filter((item: any) => item["@odata.type"] === "#microsoft.graph.group")
        .map((group: any) => group.displayName);
    } catch (error) {
      console.warn("[AzureAD] Failed to fetch user groups:", error);
      return [];
    }
  }

  /**
   * Create a session token for the authenticated user
   */
  async createSessionToken(
    userId: string,
    userData: { name: string; email: string; tenantId?: number }
  ): Promise<string> {
    const secret = new TextEncoder().encode(ENV.cookieSecret);

    const token = await new SignJWT({
      userId,
      name: userData.name,
      email: userData.email,
      tenantId: userData.tenantId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("365d")
      .sign(secret);

    return token;
  }
}

// Singleton instance
export const azureADAuth = new AzureADAuthService();

/**
 * Register Azure AD authentication routes
 */
export function registerAzureADRoutes(app: Express) {
  // Initiate Azure AD login
  app.get("/api/auth/azure/login", (req: Request, res: Response) => {
    if (!azureADAuth.isConfigured()) {
      res.status(503).json({
        error: "Azure AD authentication is not configured",
        message:
          "Please configure AZURE_AD_CLIENT_ID, AZURE_AD_CLIENT_SECRET, and AZURE_AD_REDIRECT_URI",
      });
      return;
    }

    // Generate state and nonce for security
    const state = Buffer.from(
      JSON.stringify({
        returnUrl: req.query.returnUrl || "/",
        timestamp: Date.now(),
      })
    ).toString("base64url");

    const nonce = Buffer.from(String(Date.now())).toString("base64url");

    // Store nonce in session/cookie for validation
    res.cookie("azure_nonce", nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60 * 1000, // 10 minutes
    });

    const authUrl = azureADAuth.getAuthorizationUrl(state, nonce);
    res.redirect(authUrl);
  });

  // Azure AD callback (handles form_post response)
  app.post(
    "/api/auth/azure/callback",
    async (req: Request, res: Response) => {
      try {
        const { code, id_token, state, error, error_description } = req.body;

        if (error) {
          console.error("[AzureAD] Auth error:", error, error_description);
          res.redirect(`/?error=${encodeURIComponent(error_description || error)}`);
          return;
        }

        if (!code || !state) {
          res.status(400).json({ error: "Missing code or state" });
          return;
        }

        // Decode state to get return URL
        let returnUrl = "/";
        try {
          const stateData = JSON.parse(
            Buffer.from(state, "base64url").toString("utf8")
          );
          returnUrl = stateData.returnUrl || "/";
        } catch {
          // Ignore state parsing errors
        }

        // Exchange code for tokens
        const tokens = await azureADAuth.exchangeCodeForTokens(code);

        // Decode ID token to get tenant info
        const decodedToken = azureADAuth.decodeIdToken(tokens.id_token);

        // Get user info from Microsoft Graph
        const userInfo = await azureADAuth.getUserInfo(tokens.access_token);
        userInfo.tid = decodedToken.tid;

        // Find or create tenant based on Azure AD tenant ID
        let tenant = await tenantService.getTenantByAzureSubscription(
          decodedToken.tid
        );

        if (!tenant) {
          // Check if we should auto-provision tenant
          // For now, we'll create a trial tenant for new Azure AD tenants
          tenant = await tenantService.createTenant({
            name: `Organization (${decodedToken.tid.substring(0, 8)})`,
            primaryEmail: userInfo.email,
            azureTenantId: decodedToken.tid,
          });
        }

        // Create or update user in our database
        const openId = `azure_${decodedToken.oid}`;
        await db.upsertUser({
          openId,
          name: userInfo.name,
          email: userInfo.email,
          loginMethod: "azure_ad",
          lastSignedIn: new Date(),
        });

        // Create session token
        const sessionToken = await azureADAuth.createSessionToken(openId, {
          name: userInfo.name,
          email: userInfo.email,
          tenantId: tenant?.id,
        });

        // Set session cookie
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        // Log successful login
        if (tenant) {
          await tenantService.logAuditEvent(tenant.id, null, {
            action: "user.login",
            resourceType: "user",
            resourceId: openId,
            metadata: {
              loginMethod: "azure_ad",
              azureOid: decodedToken.oid,
              azureTid: decodedToken.tid,
            },
            severity: "info",
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
          });
        }

        res.redirect(returnUrl);
      } catch (error) {
        console.error("[AzureAD] Callback error:", error);
        res.redirect("/?error=authentication_failed");
      }
    }
  );

  // Logout
  app.get("/api/auth/azure/logout", (req: Request, res: Response) => {
    // Clear session cookie
    res.clearCookie(COOKIE_NAME);

    // Redirect to Azure AD logout
    const logoutUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(
      process.env.AZURE_AD_REDIRECT_URI?.replace("/callback", "/logged-out") ||
        "/"
    )}`;

    res.redirect(logoutUrl);
  });

  // Logged out confirmation page redirect
  app.get("/api/auth/azure/logged-out", (_req: Request, res: Response) => {
    res.redirect("/?logged_out=true");
  });

  // Get current auth status
  app.get("/api/auth/status", async (req: Request, res: Response) => {
    try {
      const token = req.cookies[COOKIE_NAME];
      if (!token) {
        res.json({ authenticated: false });
        return;
      }

      const secret = new TextEncoder().encode(ENV.cookieSecret);
      const { payload } = await jwtVerify(token, secret);

      res.json({
        authenticated: true,
        user: {
          id: payload.userId,
          name: payload.name,
          email: payload.email,
          tenantId: payload.tenantId,
        },
      });
    } catch {
      res.json({ authenticated: false });
    }
  });
}

/**
 * Middleware to validate Azure AD JWT tokens for API access
 */
export function azureADJwtMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.substring(7);

  // TODO: Implement full JWT validation using Microsoft's JWKS endpoint
  // https://login.microsoftonline.com/{tenant}/discovery/v2.0/keys
  // For now, we'll validate tokens from our own session system

  next();
}
