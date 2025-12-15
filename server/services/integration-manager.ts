/**
 * Integration Configuration Manager
 * 
 * Centralized configuration for all external integrations.
 * Each integration can be individually enabled/disabled.
 * 
 * INTEGRATION STATUS OVERVIEW:
 * - UAE Pass: DISABLED (pending MOE API access)
 * - Examus Proctoring: DISABLED (pending license)
 * - TrusTell Blockchain: DISABLED (pending setup)
 * - Al Manhal: DISABLED (pending MOE API)
 * - Bayanati: DISABLED (pending MOE API)
 * - Payment Gateway: DISABLED (pending MOE account)
 * - Email/SMS: DISABLED (pending SMTP config)
 */

export interface IntegrationStatus {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  configured: boolean;
  status: 'active' | 'disabled' | 'error' | 'pending';
  lastChecked: Date;
  errorMessage?: string;
  requiredEnvVars: string[];
  documentationUrl?: string;
}

// Integration configurations
const INTEGRATIONS_CONFIG = {
  uaepass: {
    id: 'uaepass',
    name: 'UAE Pass',
    description: 'UAE National Digital Identity SSO',
    enabled: process.env.UAEPASS_ENABLED === 'true',
    requiredEnvVars: [
      'UAEPASS_CLIENT_ID',
      'UAEPASS_CLIENT_SECRET',
      'UAEPASS_REDIRECT_URI',
    ],
    documentationUrl: 'https://docs.uaepass.ae',
  },
  examus: {
    id: 'examus',
    name: 'Examus Proctoring',
    description: 'AI-powered exam proctoring service',
    enabled: process.env.EXAMUS_ENABLED === 'true',
    requiredEnvVars: [
      'EXAMUS_API_KEY',
      'EXAMUS_API_SECRET',
      'EXAMUS_ORGANIZATION_ID',
    ],
    documentationUrl: 'https://examus.com/docs',
  },
  trustell: {
    id: 'trustell',
    name: 'TrusTell Blockchain',
    description: 'Blockchain verification for licenses and credentials',
    enabled: process.env.TRUSTELL_ENABLED === 'true',
    requiredEnvVars: [
      'TRUSTELL_API_URL',
      'TRUSTELL_API_KEY',
      'TRUSTELL_API_SECRET',
    ],
    documentationUrl: 'https://trustell.ae/docs',
  },
  almanhal: {
    id: 'almanhal',
    name: 'Al Manhal',
    description: 'Teacher profile and records integration',
    enabled: process.env.ALMANHAL_ENABLED === 'true',
    requiredEnvVars: [
      'ALMANHAL_API_URL',
      'ALMANHAL_API_KEY',
    ],
    documentationUrl: null,
  },
  bayanati: {
    id: 'bayanati',
    name: 'Bayanati',
    description: 'UAE HR system integration',
    enabled: process.env.BAYANATI_ENABLED === 'true',
    requiredEnvVars: [
      'BAYANATI_API_URL',
      'BAYANATI_API_KEY',
      'BAYANATI_API_SECRET',
    ],
    documentationUrl: null,
  },
  payment: {
    id: 'payment',
    name: 'Payment Gateway',
    description: 'Online payment processing for license fees',
    enabled: process.env.PAYMENT_ENABLED === 'true',
    requiredEnvVars: [
      'STRIPE_SECRET_KEY',
      'STRIPE_PUBLISHABLE_KEY',
    ],
    documentationUrl: 'https://stripe.com/docs',
  },
  email: {
    id: 'email',
    name: 'Email Service',
    description: 'SMTP email notifications',
    enabled: process.env.SMTP_ENABLED === 'true',
    requiredEnvVars: [
      'SMTP_HOST',
      'SMTP_PORT',
      'SMTP_USER',
      'SMTP_PASSWORD',
    ],
    documentationUrl: null,
  },
  sms: {
    id: 'sms',
    name: 'SMS Gateway',
    description: 'SMS notifications for OTP and alerts',
    enabled: process.env.SMS_ENABLED === 'true',
    requiredEnvVars: [
      'SMS_API_URL',
      'SMS_API_KEY',
    ],
    documentationUrl: null,
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    description: 'AI-powered features (recommendations, analysis)',
    enabled: !!process.env.OPENAI_API_KEY,
    requiredEnvVars: [
      'OPENAI_API_KEY',
    ],
    documentationUrl: 'https://platform.openai.com/docs',
  },
  azuread: {
    id: 'azuread',
    name: 'Azure AD',
    description: 'Azure Active Directory SSO',
    enabled: !!(process.env.AZURE_AD_CLIENT_ID && process.env.AZURE_AD_CLIENT_SECRET),
    requiredEnvVars: [
      'AZURE_AD_CLIENT_ID',
      'AZURE_AD_CLIENT_SECRET',
      'AZURE_AD_TENANT_ID',
    ],
    documentationUrl: 'https://docs.microsoft.com/azure/active-directory',
  },
};

export class IntegrationManager {
  /**
   * Check if an environment variable is configured
   */
  private isEnvConfigured(envVar: string): boolean {
    return !!process.env[envVar] && process.env[envVar]!.length > 0;
  }

  /**
   * Get status of a specific integration
   */
  getIntegrationStatus(integrationId: keyof typeof INTEGRATIONS_CONFIG): IntegrationStatus {
    const config = INTEGRATIONS_CONFIG[integrationId];
    if (!config) {
      throw new Error(`Unknown integration: ${integrationId}`);
    }

    const missingVars = config.requiredEnvVars.filter(v => !this.isEnvConfigured(v));
    const configured = missingVars.length === 0;
    
    let status: IntegrationStatus['status'];
    let errorMessage: string | undefined;

    if (!config.enabled) {
      status = 'disabled';
    } else if (!configured) {
      status = 'pending';
      errorMessage = `Missing environment variables: ${missingVars.join(', ')}`;
    } else {
      status = 'active';
    }

    return {
      id: config.id,
      name: config.name,
      description: config.description,
      enabled: config.enabled,
      configured,
      status,
      lastChecked: new Date(),
      errorMessage,
      requiredEnvVars: config.requiredEnvVars,
      documentationUrl: config.documentationUrl || undefined,
    };
  }

  /**
   * Get status of all integrations
   */
  getAllIntegrationStatuses(): IntegrationStatus[] {
    return Object.keys(INTEGRATIONS_CONFIG).map(id => 
      this.getIntegrationStatus(id as keyof typeof INTEGRATIONS_CONFIG)
    );
  }

  /**
   * Check if a specific integration is enabled and configured
   */
  isIntegrationReady(integrationId: keyof typeof INTEGRATIONS_CONFIG): boolean {
    const status = this.getIntegrationStatus(integrationId);
    return status.enabled && status.configured;
  }

  /**
   * Get summary of integration status
   */
  getSummary(): {
    totalIntegrations: number;
    activeIntegrations: number;
    disabledIntegrations: number;
    pendingIntegrations: number;
    errorIntegrations: number;
  } {
    const statuses = this.getAllIntegrationStatuses();
    
    return {
      totalIntegrations: statuses.length,
      activeIntegrations: statuses.filter(s => s.status === 'active').length,
      disabledIntegrations: statuses.filter(s => s.status === 'disabled').length,
      pendingIntegrations: statuses.filter(s => s.status === 'pending').length,
      errorIntegrations: statuses.filter(s => s.status === 'error').length,
    };
  }

  /**
   * Log integration status on startup
   */
  logStatus(): void {
    console.log('\n=== Integration Status ===');
    
    const statuses = this.getAllIntegrationStatuses();
    
    for (const status of statuses) {
      const icon = status.status === 'active' ? '✅' :
                   status.status === 'disabled' ? '⏸️' :
                   status.status === 'pending' ? '⚠️' : '❌';
      
      console.log(`${icon} ${status.name}: ${status.status.toUpperCase()}`);
      
      if (status.errorMessage) {
        console.log(`   └─ ${status.errorMessage}`);
      }
    }
    
    const summary = this.getSummary();
    console.log(`\nTotal: ${summary.activeIntegrations}/${summary.totalIntegrations} active\n`);
  }
}

// Export singleton instance
export const integrationManager = new IntegrationManager();

// Log status on module load (optional - can be called from server startup)
// integrationManager.logStatus();
