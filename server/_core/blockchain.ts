/**
 * Blockchain Verification Integration (TrusTell)
 * 
 * This module provides integration with TrusTell blockchain verification service
 * for verifying teacher licenses and credentials.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Sign up for TrusTell API at: https://trustell.ae
 * 2. Obtain your API credentials (API Key, API Secret)
 * 3. Add the following environment variables to your .env file:
 *    - TRUSTELL_API_URL=https://api.trustell.ae/v1
 *    - TRUSTELL_API_KEY=your_api_key_here
 *    - TRUSTELL_API_SECRET=your_api_secret_here
 * 4. Configure webhook URL for verification callbacks
 */

interface TrusTellConfig {
  apiUrl: string;
  apiKey: string;
  apiSecret: string;
}

interface BlockchainVerificationRequest {
  documentType: "license" | "certificate" | "credential";
  documentId: string;
  holderName: string;
  holderEmiratesId: string;
  issueDate: Date;
  expiryDate?: Date;
  metadata?: Record<string, any>;
}

interface BlockchainVerificationResponse {
  verificationId: string;
  blockchainHash: string;
  timestamp: Date;
  status: "pending" | "verified" | "failed";
  verificationUrl: string;
}

interface VerificationStatusResponse {
  verificationId: string;
  status: "pending" | "verified" | "failed" | "revoked";
  blockchainHash: string;
  verifiedAt?: Date;
  revokedAt?: Date;
  verificationDetails?: Record<string, any>;
}

/**
 * TrusTell Blockchain Verification Service
 */
export class BlockchainVerificationService {
  private config: TrusTellConfig;

  constructor() {
    this.config = {
      apiUrl: process.env.TRUSTELL_API_URL || "",
      apiKey: process.env.TRUSTELL_API_KEY || "",
      apiSecret: process.env.TRUSTELL_API_SECRET || "",
    };

    if (!this.config.apiUrl || !this.config.apiKey || !this.config.apiSecret) {
      console.warn(
        "[Blockchain] TrusTell API credentials not configured. " +
        "Blockchain verification features will not be available. " +
        "Please add TRUSTELL_API_URL, TRUSTELL_API_KEY, and TRUSTELL_API_SECRET to your environment variables."
      );
    }
  }

  /**
   * Check if blockchain verification is configured
   */
  isConfigured(): boolean {
    return !!(this.config.apiUrl && this.config.apiKey && this.config.apiSecret);
  }

  /**
   * Register a document on the blockchain
   */
  async registerDocument(
    request: BlockchainVerificationRequest
  ): Promise<BlockchainVerificationResponse> {
    if (!this.isConfigured()) {
      throw new Error("Blockchain verification is not configured. Please add TrusTell API credentials.");
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/verifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.config.apiKey,
          "X-API-Secret": this.config.apiSecret,
        },
        body: JSON.stringify({
          document_type: request.documentType,
          document_id: request.documentId,
          holder_name: request.holderName,
          holder_emirates_id: request.holderEmiratesId,
          issue_date: request.issueDate.toISOString(),
          expiry_date: request.expiryDate?.toISOString(),
          metadata: request.metadata,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`TrusTell API error: ${error.message || response.statusText}`);
      }

      const data = await response.json();

      return {
        verificationId: data.verification_id,
        blockchainHash: data.blockchain_hash,
        timestamp: new Date(data.timestamp),
        status: data.status,
        verificationUrl: data.verification_url,
      };
    } catch (error) {
      console.error("[Blockchain] Failed to register document:", error);
      throw error;
    }
  }

  /**
   * Get verification status
   */
  async getVerificationStatus(verificationId: string): Promise<VerificationStatusResponse> {
    if (!this.isConfigured()) {
      throw new Error("Blockchain verification is not configured.");
    }

    try {
      const response = await fetch(
        `${this.config.apiUrl}/verifications/${verificationId}`,
        {
          headers: {
            "X-API-Key": this.config.apiKey,
            "X-API-Secret": this.config.apiSecret,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`TrusTell API error: ${error.message || response.statusText}`);
      }

      const data = await response.json();

      return {
        verificationId: data.verification_id,
        status: data.status,
        blockchainHash: data.blockchain_hash,
        verifiedAt: data.verified_at ? new Date(data.verified_at) : undefined,
        revokedAt: data.revoked_at ? new Date(data.revoked_at) : undefined,
        verificationDetails: data.verification_details,
      };
    } catch (error) {
      console.error("[Blockchain] Failed to get verification status:", error);
      throw error;
    }
  }

  /**
   * Verify a document by blockchain hash
   */
  async verifyByHash(blockchainHash: string): Promise<VerificationStatusResponse> {
    if (!this.isConfigured()) {
      throw new Error("Blockchain verification is not configured.");
    }

    try {
      const response = await fetch(
        `${this.config.apiUrl}/verify/${blockchainHash}`,
        {
          headers: {
            "X-API-Key": this.config.apiKey,
            "X-API-Secret": this.config.apiSecret,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`TrusTell API error: ${error.message || response.statusText}`);
      }

      const data = await response.json();

      return {
        verificationId: data.verification_id,
        status: data.status,
        blockchainHash: data.blockchain_hash,
        verifiedAt: data.verified_at ? new Date(data.verified_at) : undefined,
        verificationDetails: data.verification_details,
      };
    } catch (error) {
      console.error("[Blockchain] Failed to verify by hash:", error);
      throw error;
    }
  }

  /**
   * Revoke a verification
   */
  async revokeVerification(verificationId: string, reason: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error("Blockchain verification is not configured.");
    }

    try {
      const response = await fetch(
        `${this.config.apiUrl}/verifications/${verificationId}/revoke`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": this.config.apiKey,
            "X-API-Secret": this.config.apiSecret,
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`TrusTell API error: ${error.message || response.statusText}`);
      }
    } catch (error) {
      console.error("[Blockchain] Failed to revoke verification:", error);
      throw error;
    }
  }

  /**
   * Generate public verification URL
   */
  getPublicVerificationUrl(verificationId: string): string {
    return `${this.config.apiUrl}/public/verify/${verificationId}`;
  }

  /**
   * Generate QR code URL for verification
   */
  getQRCodeUrl(verificationId: string): string {
    return `${this.config.apiUrl}/qr/${verificationId}`;
  }
}

// Export singleton instance
export const blockchainService = new BlockchainVerificationService();

/**
 * Helper function to register a teacher license on blockchain
 */
export async function registerLicenseOnBlockchain(license: {
  id: number;
  licenseNumber: string;
  holderName: string;
  emiratesId: string;
  issueDate: Date;
  expiryDate: Date;
  type: string;
  tier: string;
}) {
  try {
    const result = await blockchainService.registerDocument({
      documentType: "license",
      documentId: license.licenseNumber,
      holderName: license.holderName,
      holderEmiratesId: license.emiratesId,
      issueDate: license.issueDate,
      expiryDate: license.expiryDate,
      metadata: {
        licenseId: license.id,
        licenseType: license.type,
        licenseTier: license.tier,
      },
    });

    console.log(`[Blockchain] License ${license.licenseNumber} registered:`, result.blockchainHash);
    
    return result;
  } catch (error) {
    console.error(`[Blockchain] Failed to register license ${license.licenseNumber}:`, error);
    throw error;
  }
}
