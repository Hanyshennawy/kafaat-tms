/**
 * UAE Pass Integration Service
 * 
 * Provides UAE PASS SSO authentication for the Teachers Licensing platform.
 * UAE PASS is the UAE's national digital identity solution.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Register your application at: https://selfcare.uaepass.ae
 * 2. Obtain your client credentials (Client ID, Client Secret)
 * 3. Configure redirect URIs in UAE PASS console
 * 4. Add the following environment variables:
 *    - UAEPASS_CLIENT_ID=your_client_id
 *    - UAEPASS_CLIENT_SECRET=your_client_secret
 *    - UAEPASS_REDIRECT_URI=https://yourdomain.com/api/auth/uaepass/callback
 *    - UAEPASS_ENVIRONMENT=staging | production
 * 
 * INTEGRATION STATUS: DISABLED (Enable after testing)
 */

import crypto from 'crypto';

// UAE Pass Environments
const UAEPASS_URLS = {
  staging: {
    authorize: 'https://stg-id.uaepass.ae/idshub/authorize',
    token: 'https://stg-id.uaepass.ae/idshub/token',
    userinfo: 'https://stg-id.uaepass.ae/idshub/userinfo',
  },
  production: {
    authorize: 'https://id.uaepass.ae/idshub/authorize',
    token: 'https://id.uaepass.ae/idshub/token',
    userinfo: 'https://id.uaepass.ae/idshub/userinfo',
  },
};

interface UAEPassConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  environment: 'staging' | 'production';
  enabled: boolean;
}

interface UAEPassUserInfo {
  uuid: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  mobile: string;
  emiratesId: string;
  nationality: string;
  gender: string;
  dateOfBirth: string;
  verified: boolean;
}

interface UAEPassTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export class UAEPassService {
  private config: UAEPassConfig;
  private urls: typeof UAEPASS_URLS.staging;

  constructor() {
    const environment = (process.env.UAEPASS_ENVIRONMENT as 'staging' | 'production') || 'staging';
    
    this.config = {
      clientId: process.env.UAEPASS_CLIENT_ID || '',
      clientSecret: process.env.UAEPASS_CLIENT_SECRET || '',
      redirectUri: process.env.UAEPASS_REDIRECT_URI || '',
      environment,
      // DISABLED by default - enable after testing
      enabled: process.env.UAEPASS_ENABLED === 'true',
    };

    this.urls = UAEPASS_URLS[environment];

    if (this.config.enabled) {
      if (!this.config.clientId || !this.config.clientSecret) {
        console.warn(
          '[UAEPass] UAE Pass credentials not configured. ' +
          'Please add UAEPASS_CLIENT_ID, UAEPASS_CLIENT_SECRET, and UAEPASS_REDIRECT_URI.'
        );
      } else {
        console.log(`[UAEPass] Configured for ${environment} environment`);
      }
    } else {
      console.log('[UAEPass] Integration is DISABLED. Set UAEPASS_ENABLED=true to enable.');
    }
  }

  /**
   * Check if UAE Pass is configured and enabled
   */
  isEnabled(): boolean {
    return this.config.enabled && !!this.config.clientId && !!this.config.clientSecret;
  }

  /**
   * Generate authorization URL for UAE Pass login
   */
  getAuthorizationUrl(state?: string): string {
    if (!this.isEnabled()) {
      throw new Error('UAE Pass integration is not enabled');
    }

    const stateParam = state || crypto.randomBytes(16).toString('hex');
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: 'urn:uae:digitalid:profile:general',
      state: stateParam,
      acr_values: 'urn:safelayer:tws:policies:authentication:level:low',
      ui_locales: 'en',
    });

    return `${this.urls.authorize}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<UAEPassTokenResponse> {
    if (!this.isEnabled()) {
      throw new Error('UAE Pass integration is not enabled');
    }

    const credentials = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`
    ).toString('base64');

    const response = await fetch(this.urls.token, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[UAEPass] Token exchange failed:', error);
      throw new Error(`UAE Pass token exchange failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get user information using access token
   */
  async getUserInfo(accessToken: string): Promise<UAEPassUserInfo> {
    if (!this.isEnabled()) {
      throw new Error('UAE Pass integration is not enabled');
    }

    const response = await fetch(this.urls.userinfo, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[UAEPass] Failed to get user info:', error);
      throw new Error(`Failed to get UAE Pass user info: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      uuid: data.uuid || data.sub,
      firstName: data.firstnameEN || data.firstname_en || '',
      lastName: data.lastnameEN || data.lastname_en || '',
      fullName: data.fullnameEN || data.fullname_en || `${data.firstnameEN} ${data.lastnameEN}`,
      email: data.email || '',
      mobile: data.mobile || '',
      emiratesId: data.idn || data.emirates_id || '',
      nationality: data.nationalityEN || data.nationality_en || '',
      gender: data.gender || '',
      dateOfBirth: data.dob || '',
      verified: data.userType === 'UAE Pass Verified',
    };
  }

  /**
   * Complete authentication flow
   */
  async authenticate(code: string): Promise<UAEPassUserInfo> {
    const tokens = await this.exchangeCodeForTokens(code);
    return this.getUserInfo(tokens.access_token);
  }

  /**
   * Get configuration status for admin panel
   */
  getStatus(): {
    enabled: boolean;
    configured: boolean;
    environment: string;
    message: string;
  } {
    const configured = !!this.config.clientId && !!this.config.clientSecret;
    
    return {
      enabled: this.config.enabled,
      configured,
      environment: this.config.environment,
      message: this.config.enabled
        ? configured
          ? `UAE Pass enabled (${this.config.environment})`
          : 'UAE Pass enabled but not configured'
        : 'UAE Pass integration is disabled',
    };
  }
}

// Export singleton instance
export const uaePassService = new UAEPassService();
