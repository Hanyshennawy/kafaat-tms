/**
 * Excel Import/Export Service
 * 
 * Handles bulk data import and export using Excel files.
 * Supports employee data, survey responses, performance data, etc.
 */

import * as XLSX from "xlsx";
import { storageService } from "./storage.service";
import { auditService } from "./audit.service";

// ============================================================================
// TYPES
// ============================================================================

export interface ExportOptions {
  fileName: string;
  sheetName?: string;
  userId: number;
  tenantId?: number;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: ImportError[];
  data?: any[];
}

export interface ImportError {
  row: number;
  column?: string;
  message: string;
  value?: any;
}

export interface ColumnMapping {
  excelColumn: string;
  dbField: string;
  required: boolean;
  type: "string" | "number" | "date" | "email" | "boolean" | "enum";
  enumValues?: string[];
  transform?: (value: any) => any;
  validate?: (value: any) => boolean;
}

// ============================================================================
// EXCEL SERVICE
// ============================================================================

class ExcelService {
  /**
   * Export data to Excel buffer
   */
  async exportToExcel(
    data: any[],
    options: ExportOptions
  ): Promise<{ buffer: Buffer; url?: string }> {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Auto-size columns
    const columnWidths = this.calculateColumnWidths(data);
    worksheet["!cols"] = columnWidths;

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      options.sheetName || "Data"
    );

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Optionally save to storage
    const uploadResult = await storageService.upload(
      buffer,
      options.fileName,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      {
        category: "export",
        userId: options.userId,
        tenantId: options.tenantId,
      }
    );

    await auditService.success("data.exported", {
      userId: options.userId,
      tenantId: options.tenantId,
      entityType: "excel_export",
      details: {
        fileName: options.fileName,
        rowCount: data.length,
      },
    });

    return {
      buffer,
      url: uploadResult.url,
    };
  }

  /**
   * Export multiple sheets to Excel
   */
  async exportMultiSheet(
    sheets: { name: string; data: any[] }[],
    options: ExportOptions
  ): Promise<{ buffer: Buffer; url?: string }> {
    const workbook = XLSX.utils.book_new();

    for (const sheet of sheets) {
      const worksheet = XLSX.utils.json_to_sheet(sheet.data);
      const columnWidths = this.calculateColumnWidths(sheet.data);
      worksheet["!cols"] = columnWidths;
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
    }

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    const uploadResult = await storageService.upload(
      buffer,
      options.fileName,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      {
        category: "export",
        userId: options.userId,
        tenantId: options.tenantId,
      }
    );

    return {
      buffer,
      url: uploadResult.url,
    };
  }

  /**
   * Import data from Excel buffer
   */
  async importFromExcel(
    buffer: Buffer,
    columnMappings: ColumnMapping[],
    options: {
      sheetIndex?: number;
      sheetName?: string;
      headerRow?: number;
      userId: number;
      tenantId?: number;
    }
  ): Promise<ImportResult> {
    const errors: ImportError[] = [];
    const validData: any[] = [];

    try {
      const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
      
      // Get the sheet
      let sheetName: string;
      if (options.sheetName) {
        sheetName = options.sheetName;
      } else {
        sheetName = workbook.SheetNames[options.sheetIndex || 0];
      }
      
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        return {
          success: false,
          totalRows: 0,
          successfulRows: 0,
          failedRows: 0,
          errors: [{ row: 0, message: `Sheet "${sheetName}" not found` }],
        };
      }

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
        raw: false,
      }) as any[][];

      if (jsonData.length < 2) {
        return {
          success: false,
          totalRows: 0,
          successfulRows: 0,
          failedRows: 0,
          errors: [{ row: 0, message: "No data rows found" }],
        };
      }

      // Get headers
      const headerRow = options.headerRow || 0;
      const headers = jsonData[headerRow] as string[];

      // Map column indices
      const columnIndices: Map<string, number> = new Map();
      headers.forEach((header, index) => {
        const normalizedHeader = header?.toString().trim().toLowerCase();
        columnIndices.set(normalizedHeader, index);
      });

      // Validate required columns exist
      for (const mapping of columnMappings) {
        if (mapping.required) {
          const normalizedCol = mapping.excelColumn.toLowerCase();
          if (!columnIndices.has(normalizedCol)) {
            errors.push({
              row: 0,
              column: mapping.excelColumn,
              message: `Required column "${mapping.excelColumn}" not found`,
            });
          }
        }
      }

      if (errors.length > 0) {
        return {
          success: false,
          totalRows: jsonData.length - 1,
          successfulRows: 0,
          failedRows: jsonData.length - 1,
          errors,
        };
      }

      // Process data rows
      for (let rowIndex = headerRow + 1; rowIndex < jsonData.length; rowIndex++) {
        const row = jsonData[rowIndex];
        const rowData: Record<string, any> = {};
        let rowValid = true;

        for (const mapping of columnMappings) {
          const normalizedCol = mapping.excelColumn.toLowerCase();
          const colIndex = columnIndices.get(normalizedCol);
          
          if (colIndex === undefined) {
            if (mapping.required) {
              errors.push({
                row: rowIndex + 1,
                column: mapping.excelColumn,
                message: "Required column not found",
              });
              rowValid = false;
            }
            continue;
          }

          let value = row[colIndex];

          // Check required
          if (mapping.required && (value === undefined || value === null || value === "")) {
            errors.push({
              row: rowIndex + 1,
              column: mapping.excelColumn,
              message: `${mapping.excelColumn} is required`,
              value,
            });
            rowValid = false;
            continue;
          }

          // Type validation and conversion
          const validatedValue = this.validateAndConvert(value, mapping, rowIndex + 1, errors);
          if (validatedValue === undefined && mapping.required) {
            rowValid = false;
            continue;
          }

          // Custom validation
          if (mapping.validate && validatedValue !== undefined) {
            if (!mapping.validate(validatedValue)) {
              errors.push({
                row: rowIndex + 1,
                column: mapping.excelColumn,
                message: `Invalid value for ${mapping.excelColumn}`,
                value,
              });
              rowValid = false;
              continue;
            }
          }

          // Transform
          const finalValue = mapping.transform
            ? mapping.transform(validatedValue)
            : validatedValue;

          rowData[mapping.dbField] = finalValue;
        }

        if (rowValid) {
          validData.push(rowData);
        }
      }

      await auditService.success("data.imported", {
        userId: options.userId,
        tenantId: options.tenantId,
        entityType: "excel_import",
        details: {
          totalRows: jsonData.length - 1,
          successfulRows: validData.length,
          failedRows: jsonData.length - 1 - validData.length,
        },
      });

      return {
        success: errors.length === 0 || validData.length > 0,
        totalRows: jsonData.length - 1,
        successfulRows: validData.length,
        failedRows: jsonData.length - 1 - validData.length,
        errors,
        data: validData,
      };
    } catch (error) {
      return {
        success: false,
        totalRows: 0,
        successfulRows: 0,
        failedRows: 0,
        errors: [{ row: 0, message: `Failed to parse Excel file: ${error}` }],
      };
    }
  }

  /**
   * Generate a template Excel file with headers
   */
  generateTemplate(
    columns: { name: string; example?: string; description?: string }[],
    sheetName = "Template"
  ): Buffer {
    const workbook = XLSX.utils.book_new();
    
    // Create header row
    const headers = columns.map((c) => c.name);
    const examples = columns.map((c) => c.example || "");
    
    const data = [headers];
    if (examples.some((e) => e)) {
      data.push(examples);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    worksheet["!cols"] = columns.map((c) => ({
      wch: Math.max(c.name.length, (c.example || "").length, 15),
    }));

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  }

  // ============================================================================
  // PREDEFINED TEMPLATES
  // ============================================================================

  /**
   * Employee import template
   */
  getEmployeeImportTemplate(): Buffer {
    return this.generateTemplate([
      { name: "First Name", example: "Ahmed" },
      { name: "Last Name", example: "Al-Rashid" },
      { name: "Email", example: "ahmed.rashid@moe.gov.ae" },
      { name: "Emirates ID", example: "784-1990-1234567-1" },
      { name: "Phone", example: "+971501234567" },
      { name: "Department", example: "Curriculum Development" },
      { name: "Position", example: "Curriculum Specialist" },
      { name: "Hire Date", example: "2020-01-15" },
      { name: "Manager Email", example: "manager@moe.gov.ae" },
    ], "Employees");
  }

  /**
   * Employee column mappings
   */
  getEmployeeColumnMappings(): ColumnMapping[] {
    return [
      { excelColumn: "First Name", dbField: "firstName", required: true, type: "string" },
      { excelColumn: "Last Name", dbField: "lastName", required: true, type: "string" },
      { excelColumn: "Email", dbField: "email", required: true, type: "email" },
      { excelColumn: "Emirates ID", dbField: "emiratesId", required: false, type: "string" },
      { excelColumn: "Phone", dbField: "phone", required: false, type: "string" },
      { excelColumn: "Department", dbField: "departmentName", required: false, type: "string" },
      { excelColumn: "Position", dbField: "positionTitle", required: false, type: "string" },
      { excelColumn: "Hire Date", dbField: "hireDate", required: false, type: "date" },
      { excelColumn: "Manager Email", dbField: "managerEmail", required: false, type: "email" },
    ];
  }

  /**
   * Survey response export format
   */
  formatSurveyResponsesForExport(responses: any[]): any[] {
    return responses.map((r) => ({
      "Response ID": r.id,
      "Survey": r.surveyTitle,
      "Respondent": r.respondentName || "Anonymous",
      "Submitted At": r.submittedAt,
      "Score": r.score,
      ...r.answers,
    }));
  }

  /**
   * Performance data export format
   */
  formatPerformanceDataForExport(data: any[]): any[] {
    return data.map((d) => ({
      "Employee": d.employeeName,
      "Department": d.departmentName,
      "Cycle": d.cycleName,
      "Goal Count": d.goalCount,
      "Goals Completed": d.goalsCompleted,
      "Self Rating": d.selfRating,
      "Manager Rating": d.managerRating,
      "Final Rating": d.finalRating,
      "Status": d.status,
    }));
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private validateAndConvert(
    value: any,
    mapping: ColumnMapping,
    rowNumber: number,
    errors: ImportError[]
  ): any {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }

    switch (mapping.type) {
      case "string":
        return String(value).trim();

      case "number":
        const num = Number(value);
        if (isNaN(num)) {
          errors.push({
            row: rowNumber,
            column: mapping.excelColumn,
            message: `Invalid number value`,
            value,
          });
          return undefined;
        }
        return num;

      case "date":
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          errors.push({
            row: rowNumber,
            column: mapping.excelColumn,
            message: `Invalid date value`,
            value,
          });
          return undefined;
        }
        return date;

      case "email":
        const email = String(value).trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errors.push({
            row: rowNumber,
            column: mapping.excelColumn,
            message: `Invalid email format`,
            value,
          });
          return undefined;
        }
        return email;

      case "boolean":
        const boolStr = String(value).toLowerCase().trim();
        if (["true", "yes", "1", "y"].includes(boolStr)) return true;
        if (["false", "no", "0", "n"].includes(boolStr)) return false;
        errors.push({
          row: rowNumber,
          column: mapping.excelColumn,
          message: `Invalid boolean value (use yes/no, true/false, 1/0)`,
          value,
        });
        return undefined;

      case "enum":
        const enumValue = String(value).trim();
        if (mapping.enumValues && !mapping.enumValues.includes(enumValue)) {
          errors.push({
            row: rowNumber,
            column: mapping.excelColumn,
            message: `Invalid value. Must be one of: ${mapping.enumValues.join(", ")}`,
            value,
          });
          return undefined;
        }
        return enumValue;

      default:
        return value;
    }
  }

  private calculateColumnWidths(data: any[]): { wch: number }[] {
    if (data.length === 0) return [];

    const keys = Object.keys(data[0]);
    return keys.map((key) => {
      let maxWidth = key.length;
      for (const row of data) {
        const value = row[key];
        if (value !== null && value !== undefined) {
          const valueLength = String(value).length;
          if (valueLength > maxWidth) {
            maxWidth = valueLength;
          }
        }
      }
      return { wch: Math.min(maxWidth + 2, 50) };
    });
  }
}

// Singleton instance
export const excelService = new ExcelService();
