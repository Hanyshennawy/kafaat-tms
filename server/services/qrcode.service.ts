/**
 * QR Code Verification Service
 * 
 * Generates and validates QR codes for teacher licenses and credentials.
 * Uses blockchain verification when available for enhanced security.
 */

import crypto from 'crypto';
import { blockchainService } from '../_core/blockchain';

interface QRCodeData {
  type: 'license' | 'certificate' | 'credential';
  id: string;
  holderName: string;
  issuedDate: string;
  expiryDate?: string;
  verificationCode: string;
  blockchainHash?: string;
}

interface VerificationResult {
  valid: boolean;
  status: 'valid' | 'expired' | 'revoked' | 'not_found' | 'invalid';
  data?: {
    type: string;
    holderName: string;
    issuedDate: Date;
    expiryDate?: Date;
    licenseType?: string;
    licenseTier?: string;
    emiratesId?: string;
    blockchainVerified: boolean;
  };
  message: string;
  verifiedAt: Date;
}

// Secret key for HMAC verification (should be in env)
const VERIFICATION_SECRET = process.env.QR_VERIFICATION_SECRET || 'kafaat-qr-secret-key-2025';

export class QRCodeService {
  /**
   * Generate verification code using HMAC
   */
  private generateVerificationCode(data: Omit<QRCodeData, 'verificationCode'>): string {
    const payload = `${data.type}:${data.id}:${data.holderName}:${data.issuedDate}`;
    return crypto
      .createHmac('sha256', VERIFICATION_SECRET)
      .update(payload)
      .digest('hex')
      .substring(0, 16)
      .toUpperCase();
  }

  /**
   * Generate QR code data for a license
   */
  generateLicenseQRData(license: {
    id: number;
    licenseNumber: string;
    holderName: string;
    issueDate: Date;
    expiryDate?: Date;
    blockchainHash?: string;
  }): string {
    const data: QRCodeData = {
      type: 'license',
      id: license.licenseNumber,
      holderName: license.holderName,
      issuedDate: license.issueDate.toISOString().split('T')[0],
      expiryDate: license.expiryDate?.toISOString().split('T')[0],
      verificationCode: '',
      blockchainHash: license.blockchainHash,
    };

    data.verificationCode = this.generateVerificationCode(data);

    // Create verification URL
    const baseUrl = process.env.APP_URL || 'https://kafaat.moe.gov.ae';
    const verificationUrl = `${baseUrl}/verify/${data.type}/${data.id}?code=${data.verificationCode}`;

    return verificationUrl;
  }

  /**
   * Generate QR code data for a certificate
   */
  generateCertificateQRData(certificate: {
    id: number;
    certificateNumber: string;
    holderName: string;
    issueDate: Date;
    blockchainHash?: string;
  }): string {
    const data: QRCodeData = {
      type: 'certificate',
      id: certificate.certificateNumber,
      holderName: certificate.holderName,
      issuedDate: certificate.issueDate.toISOString().split('T')[0],
      verificationCode: '',
      blockchainHash: certificate.blockchainHash,
    };

    data.verificationCode = this.generateVerificationCode(data);

    const baseUrl = process.env.APP_URL || 'https://kafaat.moe.gov.ae';
    return `${baseUrl}/verify/${data.type}/${data.id}?code=${data.verificationCode}`;
  }

  /**
   * Verify QR code data
   */
  async verifyQRCode(params: {
    type: 'license' | 'certificate' | 'credential';
    id: string;
    verificationCode: string;
  }): Promise<VerificationResult> {
    const { type, id, verificationCode } = params;

    try {
      // Look up the document in the database
      const document = await this.lookupDocument(type, id);

      if (!document) {
        return {
          valid: false,
          status: 'not_found',
          message: 'Document not found in the system',
          verifiedAt: new Date(),
        };
      }

      // Regenerate verification code and compare
      const expectedCode = this.generateVerificationCode({
        type,
        id,
        holderName: document.holderName,
        issuedDate: document.issuedDate.toISOString().split('T')[0],
        expiryDate: document.expiryDate?.toISOString().split('T')[0],
        blockchainHash: document.blockchainHash,
      });

      if (verificationCode.toUpperCase() !== expectedCode) {
        return {
          valid: false,
          status: 'invalid',
          message: 'Invalid verification code - document may have been tampered with',
          verifiedAt: new Date(),
        };
      }

      // Check expiry
      if (document.expiryDate && new Date(document.expiryDate) < new Date()) {
        return {
          valid: false,
          status: 'expired',
          data: {
            type,
            holderName: document.holderName,
            issuedDate: document.issuedDate,
            expiryDate: document.expiryDate,
            licenseType: document.licenseType,
            licenseTier: document.licenseTier,
            blockchainVerified: false,
          },
          message: 'This document has expired',
          verifiedAt: new Date(),
        };
      }

      // Check revocation status
      if (document.status === 'revoked' || document.status === 'suspended') {
        return {
          valid: false,
          status: 'revoked',
          data: {
            type,
            holderName: document.holderName,
            issuedDate: document.issuedDate,
            expiryDate: document.expiryDate,
            blockchainVerified: false,
          },
          message: `This document has been ${document.status}`,
          verifiedAt: new Date(),
        };
      }

      // Verify with blockchain if available
      let blockchainVerified = false;
      if (document.blockchainHash && blockchainService.isConfigured()) {
        try {
          const blockchainStatus = await blockchainService.verifyByHash(document.blockchainHash);
          blockchainVerified = blockchainStatus.status === 'verified';
        } catch (error) {
          console.warn('[QRCode] Blockchain verification failed:', error);
        }
      }

      return {
        valid: true,
        status: 'valid',
        data: {
          type,
          holderName: document.holderName,
          issuedDate: document.issuedDate,
          expiryDate: document.expiryDate,
          licenseType: document.licenseType,
          licenseTier: document.licenseTier,
          emiratesId: this.maskEmiratesId(document.emiratesId),
          blockchainVerified,
        },
        message: blockchainVerified
          ? 'Document verified successfully (blockchain verified)'
          : 'Document verified successfully',
        verifiedAt: new Date(),
      };
    } catch (error) {
      console.error('[QRCode] Verification error:', error);
      return {
        valid: false,
        status: 'invalid',
        message: 'An error occurred during verification',
        verifiedAt: new Date(),
      };
    }
  }

  /**
   * Look up document in database (placeholder - integrate with actual DB)
   */
  private async lookupDocument(type: string, id: string): Promise<{
    holderName: string;
    issuedDate: Date;
    expiryDate?: Date;
    blockchainHash?: string;
    licenseType?: string;
    licenseTier?: string;
    emiratesId?: string;
    status: string;
  } | null> {
    // TODO: Integrate with actual database queries
    // For now, return demo data for testing
    
    // This would be replaced with actual DB lookup:
    // const license = await db.getLicenseByNumber(id);
    
    // Demo data for testing
    if (type === 'license' && id.startsWith('LIC')) {
      return {
        holderName: 'Ahmed Mohammed Al-Rashid',
        issuedDate: new Date('2024-01-15'),
        expiryDate: new Date('2027-01-15'),
        licenseType: 'Teacher License',
        licenseTier: 'Tier 2',
        emiratesId: '784-1990-1234567-1',
        status: 'active',
      };
    }

    return null;
  }

  /**
   * Mask Emirates ID for privacy
   */
  private maskEmiratesId(emiratesId?: string): string | undefined {
    if (!emiratesId) return undefined;
    // Show first 3 and last 2 characters, mask the rest
    const parts = emiratesId.split('-');
    if (parts.length === 4) {
      return `${parts[0]}-****-*******-${parts[3]}`;
    }
    return emiratesId.substring(0, 3) + '*'.repeat(emiratesId.length - 5) + emiratesId.substring(emiratesId.length - 2);
  }

  /**
   * Generate QR code image URL (using external service or local generation)
   */
  generateQRImageUrl(data: string, size: number = 200): string {
    // Using QR Server API for QR code generation
    // In production, you might want to use a local library like 'qrcode'
    const encodedData = encodeURIComponent(data);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}`;
  }

  /**
   * Generate downloadable QR code as base64 (using fetch to QR API)
   */
  async generateQRBase64(data: string, size: number = 200): Promise<string> {
    const url = this.generateQRImageUrl(data, size);
    
    try {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      return `data:image/png;base64,${base64}`;
    } catch (error) {
      console.error('[QRCode] Failed to generate QR image:', error);
      throw new Error('Failed to generate QR code');
    }
  }
}

// Export singleton instance
export const qrCodeService = new QRCodeService();
