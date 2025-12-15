/**
 * Azure Blob Storage Service
 * 
 * Handles file uploads for resumes, documents, certificates, profile photos, etc.
 * Falls back to local storage in development mode.
 */

import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";

// ============================================================================
// TYPES
// ============================================================================

export interface UploadResult {
  success: boolean;
  url: string;
  key: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

export interface FileMetadata {
  key: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedBy: number;
  tenantId?: number;
  category: FileCategory;
  entityType?: string;
  entityId?: number;
  createdAt: Date;
}

export type FileCategory = 
  | "resume"
  | "certificate"
  | "license_document"
  | "profile_photo"
  | "evidence"
  | "report"
  | "import"
  | "export"
  | "attachment";

// ============================================================================
// CONFIGURATION
// ============================================================================

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_STORAGE_CONTAINER = process.env.AZURE_STORAGE_CONTAINER || "kafaat-files";
const USE_LOCAL_STORAGE = !AZURE_STORAGE_CONNECTION_STRING || process.env.NODE_ENV === "development";
const LOCAL_STORAGE_PATH = path.join(process.cwd(), "uploads");

// Ensure local storage directory exists
if (USE_LOCAL_STORAGE && !fs.existsSync(LOCAL_STORAGE_PATH)) {
  fs.mkdirSync(LOCAL_STORAGE_PATH, { recursive: true });
}

// ============================================================================
// STORAGE SERVICE
// ============================================================================

class StorageService {
  private isAzureConfigured: boolean;

  constructor() {
    this.isAzureConfigured = !!AZURE_STORAGE_CONNECTION_STRING;
    
    if (this.isAzureConfigured) {
      console.log("[Storage] Azure Blob Storage configured");
    } else {
      console.log("[Storage] Using local file storage (development mode)");
    }
  }

  /**
   * Upload a file
   */
  async upload(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    options: {
      category: FileCategory;
      userId: number;
      tenantId?: number;
      entityType?: string;
      entityId?: number;
    }
  ): Promise<UploadResult> {
    const key = this.generateKey(options.category, fileName);
    const size = fileBuffer.length;

    try {
      if (this.isAzureConfigured) {
        return await this.uploadToAzure(fileBuffer, key, fileName, mimeType, size);
      } else {
        return await this.uploadToLocal(fileBuffer, key, fileName, mimeType, size);
      }
    } catch (error) {
      console.error("[Storage] Upload failed:", error);
      throw new Error(`Failed to upload file: ${error}`);
    }
  }

  /**
   * Upload from base64 string
   */
  async uploadBase64(
    base64Data: string,
    fileName: string,
    mimeType: string,
    options: {
      category: FileCategory;
      userId: number;
      tenantId?: number;
    }
  ): Promise<UploadResult> {
    // Remove data URL prefix if present
    const base64Content = base64Data.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(base64Content, "base64");
    return this.upload(buffer, fileName, mimeType, options);
  }

  /**
   * Get a signed URL for downloading a file
   */
  async getDownloadUrl(key: string, expiresInMinutes = 60): Promise<string> {
    if (this.isAzureConfigured) {
      return this.getAzureSignedUrl(key, expiresInMinutes);
    } else {
      return `/api/files/${key}`;
    }
  }

  /**
   * Delete a file
   */
  async delete(key: string): Promise<boolean> {
    try {
      if (this.isAzureConfigured) {
        return await this.deleteFromAzure(key);
      } else {
        return await this.deleteFromLocal(key);
      }
    } catch (error) {
      console.error("[Storage] Delete failed:", error);
      return false;
    }
  }

  /**
   * Get file as buffer
   */
  async getFile(key: string): Promise<Buffer | null> {
    try {
      if (this.isAzureConfigured) {
        return await this.getFromAzure(key);
      } else {
        return await this.getFromLocal(key);
      }
    } catch (error) {
      console.error("[Storage] Get file failed:", error);
      return null;
    }
  }

  // ============================================================================
  // PRIVATE METHODS - LOCAL STORAGE
  // ============================================================================

  private async uploadToLocal(
    buffer: Buffer,
    key: string,
    fileName: string,
    mimeType: string,
    size: number
  ): Promise<UploadResult> {
    const filePath = path.join(LOCAL_STORAGE_PATH, key);
    const dir = path.dirname(filePath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, buffer);

    return {
      success: true,
      url: `/api/files/${key}`,
      key,
      fileName,
      mimeType,
      size,
      uploadedAt: new Date(),
    };
  }

  private async getFromLocal(key: string): Promise<Buffer | null> {
    const filePath = path.join(LOCAL_STORAGE_PATH, key);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath);
    }
    return null;
  }

  private async deleteFromLocal(key: string): Promise<boolean> {
    const filePath = path.join(LOCAL_STORAGE_PATH, key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  // ============================================================================
  // PRIVATE METHODS - AZURE BLOB STORAGE
  // ============================================================================

  private async uploadToAzure(
    buffer: Buffer,
    key: string,
    fileName: string,
    mimeType: string,
    size: number
  ): Promise<UploadResult> {
    // Dynamic import of Azure SDK
    const { BlobServiceClient } = await import("@azure/storage-blob");
    
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING!
    );
    const containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER);
    
    // Ensure container exists
    await containerClient.createIfNotExists({ access: "blob" });
    
    const blockBlobClient = containerClient.getBlockBlobClient(key);
    
    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: {
        blobContentType: mimeType,
        blobContentDisposition: `attachment; filename="${fileName}"`,
      },
    });

    return {
      success: true,
      url: blockBlobClient.url,
      key,
      fileName,
      mimeType,
      size,
      uploadedAt: new Date(),
    };
  }

  private async getAzureSignedUrl(key: string, expiresInMinutes: number): Promise<string> {
    const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } = 
      await import("@azure/storage-blob");
    
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING!
    );
    const containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER);
    const blobClient = containerClient.getBlobClient(key);

    // For simplicity, return the direct URL (in production, generate SAS token)
    return blobClient.url;
  }

  private async getFromAzure(key: string): Promise<Buffer | null> {
    const { BlobServiceClient } = await import("@azure/storage-blob");
    
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING!
    );
    const containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER);
    const blobClient = containerClient.getBlobClient(key);

    const downloadResponse = await blobClient.download();
    const chunks: Buffer[] = [];
    
    for await (const chunk of downloadResponse.readableStreamBody as NodeJS.ReadableStream) {
      chunks.push(Buffer.from(chunk));
    }
    
    return Buffer.concat(chunks);
  }

  private async deleteFromAzure(key: string): Promise<boolean> {
    const { BlobServiceClient } = await import("@azure/storage-blob");
    
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING!
    );
    const containerClient = blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER);
    const blobClient = containerClient.getBlobClient(key);

    await blobClient.delete();
    return true;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private generateKey(category: FileCategory, fileName: string): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const uuid = randomUUID();
    const ext = path.extname(fileName);
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    
    return `${category}/${year}/${month}/${uuid}${ext}`;
  }

  /**
   * Validate file type
   */
  validateFileType(mimeType: string, category: FileCategory): boolean {
    const allowedTypes: Record<FileCategory, string[]> = {
      resume: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      certificate: ["application/pdf", "image/jpeg", "image/png"],
      license_document: ["application/pdf", "image/jpeg", "image/png"],
      profile_photo: ["image/jpeg", "image/png", "image/webp"],
      evidence: [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      report: ["application/pdf"],
      import: [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
      ],
      export: [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/pdf",
      ],
      attachment: [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ],
    };

    return allowedTypes[category]?.includes(mimeType) ?? false;
  }

  /**
   * Get max file size for category (in bytes)
   */
  getMaxFileSize(category: FileCategory): number {
    const maxSizes: Record<FileCategory, number> = {
      resume: 10 * 1024 * 1024, // 10MB
      certificate: 5 * 1024 * 1024, // 5MB
      license_document: 10 * 1024 * 1024, // 10MB
      profile_photo: 2 * 1024 * 1024, // 2MB
      evidence: 20 * 1024 * 1024, // 20MB
      report: 50 * 1024 * 1024, // 50MB
      import: 50 * 1024 * 1024, // 50MB
      export: 100 * 1024 * 1024, // 100MB
      attachment: 25 * 1024 * 1024, // 25MB
    };

    return maxSizes[category] ?? 10 * 1024 * 1024;
  }
}

// Singleton instance
export const storageService = new StorageService();
