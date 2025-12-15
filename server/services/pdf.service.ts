/**
 * PDF Generation Service
 * 
 * Generates PDF documents for licenses, certificates, reports, etc.
 * Uses PDFKit for server-side PDF generation.
 */

import PDFDocument from "pdfkit";
import { storageService } from "./storage.service";

// ============================================================================
// TYPES
// ============================================================================

export interface PDFGenerationResult {
  success: boolean;
  buffer?: Buffer;
  url?: string;
  key?: string;
  error?: string;
}

export interface LicenseData {
  licenseNumber: string;
  holderName: string;
  holderNameArabic?: string;
  emiratesId: string;
  licenseType: string;
  specialization?: string;
  issueDate: Date;
  expiryDate: Date;
  issuingAuthority: string;
  qrCodeUrl?: string;
  photoUrl?: string;
}

export interface CertificateData {
  certificateNumber: string;
  recipientName: string;
  courseName: string;
  completionDate: Date;
  duration: string;
  instructor?: string;
  organization: string;
}

export interface ReportData {
  title: string;
  subtitle?: string;
  generatedDate: Date;
  generatedBy: string;
  sections: ReportSection[];
  footer?: string;
}

export interface ReportSection {
  title: string;
  content?: string;
  table?: {
    headers: string[];
    rows: string[][];
  };
  chart?: {
    type: "bar" | "pie" | "line";
    data: { label: string; value: number }[];
  };
}

// ============================================================================
// PDF GENERATION SERVICE
// ============================================================================

class PDFService {
  private readonly colors = {
    primary: "#1E40AF", // Blue
    secondary: "#059669", // Green
    accent: "#D97706", // Amber
    text: "#1F2937",
    textLight: "#6B7280",
    border: "#E5E7EB",
    background: "#F9FAFB",
  };

  private readonly fonts = {
    regular: "Helvetica",
    bold: "Helvetica-Bold",
  };

  /**
   * Generate a Teaching License PDF
   */
  async generateLicense(data: LicenseData): Promise<PDFGenerationResult> {
    try {
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margin: 40,
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));

      // Header with logo placeholder
      doc
        .fillColor(this.colors.primary)
        .fontSize(28)
        .font(this.fonts.bold)
        .text("UAE MINISTRY OF EDUCATION", 40, 40, { align: "center" });

      doc
        .fillColor(this.colors.text)
        .fontSize(22)
        .text("وزارة التربية والتعليم", { align: "center", features: ["rtla"] });

      // License Title
      doc
        .moveDown(2)
        .fillColor(this.colors.secondary)
        .fontSize(24)
        .font(this.fonts.bold)
        .text("TEACHING LICENSE", { align: "center" });

      doc.fontSize(18).text("رخصة التدريس", { align: "center" });

      // Decorative line
      doc
        .moveDown()
        .strokeColor(this.colors.primary)
        .lineWidth(2)
        .moveTo(150, doc.y)
        .lineTo(doc.page.width - 150, doc.y)
        .stroke();

      // License details
      doc.moveDown(2);
      const startY = doc.y;
      const leftCol = 100;
      const rightCol = doc.page.width / 2 + 50;

      // Left column
      this.addLicenseField(doc, "License Number", data.licenseNumber, leftCol, startY);
      this.addLicenseField(doc, "Holder Name", data.holderName, leftCol, startY + 50);
      this.addLicenseField(doc, "Emirates ID", data.emiratesId, leftCol, startY + 100);
      this.addLicenseField(doc, "License Type", data.licenseType, leftCol, startY + 150);

      // Right column
      this.addLicenseField(doc, "Specialization", data.specialization || "N/A", rightCol, startY);
      this.addLicenseField(doc, "Issue Date", this.formatDate(data.issueDate), rightCol, startY + 50);
      this.addLicenseField(doc, "Expiry Date", this.formatDate(data.expiryDate), rightCol, startY + 100);
      this.addLicenseField(doc, "Issuing Authority", data.issuingAuthority, rightCol, startY + 150);

      // Footer
      doc
        .fontSize(10)
        .fillColor(this.colors.textLight)
        .text(
          "This license is issued in accordance with UAE Federal Law No. 1 of 2017 concerning the teaching profession.",
          40,
          doc.page.height - 80,
          { align: "center", width: doc.page.width - 80 }
        );

      doc
        .fontSize(8)
        .text(
          `Verify at: https://kafaat.ae/verify/${data.licenseNumber}`,
          { align: "center" }
        );

      doc.end();

      return new Promise((resolve) => {
        doc.on("end", () => {
          const buffer = Buffer.concat(chunks);
          resolve({
            success: true,
            buffer,
          });
        });
      });
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate license PDF: ${error}`,
      };
    }
  }

  /**
   * Generate a Certificate PDF
   */
  async generateCertificate(data: CertificateData): Promise<PDFGenerationResult> {
    try {
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margin: 50,
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));

      // Border
      doc
        .strokeColor(this.colors.primary)
        .lineWidth(3)
        .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
        .stroke();

      doc
        .strokeColor(this.colors.secondary)
        .lineWidth(1)
        .rect(40, 40, doc.page.width - 80, doc.page.height - 80)
        .stroke();

      // Header
      doc
        .fillColor(this.colors.primary)
        .fontSize(16)
        .font(this.fonts.bold)
        .text(data.organization, 50, 60, { align: "center" });

      doc
        .moveDown(2)
        .fontSize(36)
        .fillColor(this.colors.secondary)
        .text("CERTIFICATE OF COMPLETION", { align: "center" });

      // Main content
      doc
        .moveDown(2)
        .fontSize(14)
        .fillColor(this.colors.text)
        .font(this.fonts.regular)
        .text("This is to certify that", { align: "center" });

      doc
        .moveDown()
        .fontSize(28)
        .font(this.fonts.bold)
        .fillColor(this.colors.primary)
        .text(data.recipientName, { align: "center" });

      doc
        .moveDown()
        .fontSize(14)
        .font(this.fonts.regular)
        .fillColor(this.colors.text)
        .text("has successfully completed the course", { align: "center" });

      doc
        .moveDown()
        .fontSize(22)
        .font(this.fonts.bold)
        .fillColor(this.colors.secondary)
        .text(data.courseName, { align: "center" });

      doc
        .moveDown()
        .fontSize(12)
        .font(this.fonts.regular)
        .fillColor(this.colors.textLight)
        .text(`Duration: ${data.duration}`, { align: "center" });

      // Date and signature area
      const bottomY = doc.page.height - 120;
      
      doc
        .fontSize(12)
        .fillColor(this.colors.text)
        .text(`Date: ${this.formatDate(data.completionDate)}`, 100, bottomY);

      doc
        .text(`Certificate No: ${data.certificateNumber}`, 100, bottomY + 20);

      if (data.instructor) {
        doc
          .text(`Instructor: ${data.instructor}`, doc.page.width - 250, bottomY);
      }

      doc.end();

      return new Promise((resolve) => {
        doc.on("end", () => {
          const buffer = Buffer.concat(chunks);
          resolve({
            success: true,
            buffer,
          });
        });
      });
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate certificate PDF: ${error}`,
      };
    }
  }

  /**
   * Generate a Report PDF
   */
  async generateReport(data: ReportData): Promise<PDFGenerationResult> {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));

      // Header
      doc
        .fillColor(this.colors.primary)
        .fontSize(24)
        .font(this.fonts.bold)
        .text(data.title, { align: "center" });

      if (data.subtitle) {
        doc
          .fontSize(14)
          .fillColor(this.colors.textLight)
          .font(this.fonts.regular)
          .text(data.subtitle, { align: "center" });
      }

      doc
        .moveDown()
        .fontSize(10)
        .text(`Generated: ${this.formatDate(data.generatedDate)} by ${data.generatedBy}`, { align: "right" });

      doc
        .strokeColor(this.colors.border)
        .lineWidth(1)
        .moveTo(50, doc.y + 10)
        .lineTo(doc.page.width - 50, doc.y + 10)
        .stroke();

      doc.moveDown(2);

      // Sections
      for (const section of data.sections) {
        this.addReportSection(doc, section);
      }

      // Footer on all pages
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        
        doc
          .fontSize(8)
          .fillColor(this.colors.textLight)
          .text(
            data.footer || "Kafaat Talent Management System - Confidential",
            50,
            doc.page.height - 40,
            { align: "center", width: doc.page.width - 100 }
          );
        
        doc.text(`Page ${i + 1} of ${pages.count}`, { align: "right" });
      }

      doc.end();

      return new Promise((resolve) => {
        doc.on("end", () => {
          const buffer = Buffer.concat(chunks);
          resolve({
            success: true,
            buffer,
          });
        });
      });
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate report PDF: ${error}`,
      };
    }
  }

  /**
   * Generate and save PDF to storage
   */
  async generateAndSave(
    type: "license" | "certificate" | "report",
    data: LicenseData | CertificateData | ReportData,
    options: {
      userId: number;
      tenantId?: number;
      fileName?: string;
    }
  ): Promise<PDFGenerationResult> {
    let result: PDFGenerationResult;

    switch (type) {
      case "license":
        result = await this.generateLicense(data as LicenseData);
        break;
      case "certificate":
        result = await this.generateCertificate(data as CertificateData);
        break;
      case "report":
        result = await this.generateReport(data as ReportData);
        break;
    }

    if (!result.success || !result.buffer) {
      return result;
    }

    // Save to storage
    const fileName = options.fileName || `${type}_${Date.now()}.pdf`;
    const uploadResult = await storageService.upload(
      result.buffer,
      fileName,
      "application/pdf",
      {
        category: type === "report" ? "report" : "certificate",
        userId: options.userId,
        tenantId: options.tenantId,
      }
    );

    return {
      success: true,
      buffer: result.buffer,
      url: uploadResult.url,
      key: uploadResult.key,
    };
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private addLicenseField(
    doc: PDFKit.PDFDocument,
    label: string,
    value: string,
    x: number,
    y: number
  ): void {
    doc
      .fontSize(10)
      .fillColor(this.colors.textLight)
      .font(this.fonts.regular)
      .text(label, x, y);

    doc
      .fontSize(14)
      .fillColor(this.colors.text)
      .font(this.fonts.bold)
      .text(value, x, y + 15);
  }

  private addReportSection(
    doc: PDFKit.PDFDocument,
    section: ReportSection
  ): void {
    // Section title
    doc
      .fontSize(16)
      .fillColor(this.colors.primary)
      .font(this.fonts.bold)
      .text(section.title);

    doc.moveDown(0.5);

    // Content
    if (section.content) {
      doc
        .fontSize(11)
        .fillColor(this.colors.text)
        .font(this.fonts.regular)
        .text(section.content);
      doc.moveDown();
    }

    // Table
    if (section.table) {
      this.addTable(doc, section.table.headers, section.table.rows);
      doc.moveDown();
    }

    doc.moveDown();
  }

  private addTable(
    doc: PDFKit.PDFDocument,
    headers: string[],
    rows: string[][]
  ): void {
    const tableTop = doc.y;
    const colWidth = (doc.page.width - 100) / headers.length;
    const rowHeight = 25;

    // Header row
    doc
      .fillColor(this.colors.primary)
      .rect(50, tableTop, doc.page.width - 100, rowHeight)
      .fill();

    headers.forEach((header, i) => {
      doc
        .fillColor("white")
        .fontSize(10)
        .font(this.fonts.bold)
        .text(header, 55 + i * colWidth, tableTop + 7, {
          width: colWidth - 10,
          align: "left",
        });
    });

    // Data rows
    rows.forEach((row, rowIndex) => {
      const y = tableTop + (rowIndex + 1) * rowHeight;
      
      // Alternate row background
      if (rowIndex % 2 === 0) {
        doc
          .fillColor(this.colors.background)
          .rect(50, y, doc.page.width - 100, rowHeight)
          .fill();
      }

      row.forEach((cell, colIndex) => {
        doc
          .fillColor(this.colors.text)
          .fontSize(9)
          .font(this.fonts.regular)
          .text(cell, 55 + colIndex * colWidth, y + 7, {
            width: colWidth - 10,
            align: "left",
          });
      });
    });

    doc.y = tableTop + (rows.length + 1) * rowHeight + 10;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString("en-AE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}

// Singleton instance
export const pdfService = new PDFService();
