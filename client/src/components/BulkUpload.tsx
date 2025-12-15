import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText,
  Loader2,
  Trash2,
  RefreshCcw,
  Eye
} from "lucide-react";
import { toast } from "sonner";

export interface BulkUploadColumn {
  key: string;
  label: string;
  required: boolean;
  type?: "text" | "email" | "number" | "date" | "select";
  options?: string[]; // For select type
  description?: string;
}

export interface BulkUploadResult {
  row: number;
  status: "success" | "error" | "warning";
  message: string;
  data?: Record<string, any>;
}

interface BulkUploadProps {
  title: string;
  description: string;
  columns: BulkUploadColumn[];
  templateFileName: string;
  onUpload: (data: Record<string, any>[]) => Promise<BulkUploadResult[]>;
  onComplete?: () => void;
  triggerButton?: React.ReactNode;
  icon?: React.ReactNode;
  exampleData?: Record<string, any>[];
}

export function BulkUpload({
  title,
  description,
  columns,
  templateFileName,
  onUpload,
  onComplete,
  triggerButton,
  icon,
  exampleData
}: BulkUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, any>[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ row: number; errors: string[] }[]>([]);
  const [uploadResults, setUploadResults] = useState<BulkUploadResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // Generate CSV template
  const generateTemplate = useCallback(() => {
    const headers = columns.map(col => col.label).join(",");
    const exampleRows = exampleData?.map(row => 
      columns.map(col => row[col.key] || "").join(",")
    ).join("\n") || columns.map(col => col.description || `Example ${col.label}`).join(",");
    
    const csvContent = `${headers}\n${exampleRows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${templateFileName}.csv`;
    link.click();
    toast.success("Template downloaded successfully!");
  }, [columns, templateFileName, exampleData]);

  // Parse CSV file
  const parseCSV = useCallback((text: string): Record<string, any>[] => {
    const lines = text.split("\n").filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
    const data: Record<string, any>[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim().replace(/"/g, ""));
      const row: Record<string, any> = {};
      
      headers.forEach((header, idx) => {
        // Match header to column key
        const column = columns.find(c => 
          c.label.toLowerCase() === header.toLowerCase() ||
          c.key.toLowerCase() === header.toLowerCase()
        );
        if (column) {
          row[column.key] = values[idx] || "";
        }
      });
      
      if (Object.keys(row).length > 0) {
        data.push(row);
      }
    }
    
    return data;
  }, [columns]);

  // Validate parsed data
  const validateData = useCallback((data: Record<string, any>[]): { row: number; errors: string[] }[] => {
    const errors: { row: number; errors: string[] }[] = [];
    
    data.forEach((row, idx) => {
      const rowErrors: string[] = [];
      
      columns.forEach(col => {
        if (col.required && (!row[col.key] || row[col.key].toString().trim() === "")) {
          rowErrors.push(`${col.label} is required`);
        }
        
        if (row[col.key] && col.type === "email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(row[col.key])) {
            rowErrors.push(`${col.label} must be a valid email`);
          }
        }
        
        if (row[col.key] && col.type === "number") {
          if (isNaN(Number(row[col.key]))) {
            rowErrors.push(`${col.label} must be a number`);
          }
        }
        
        if (row[col.key] && col.type === "select" && col.options) {
          if (!col.options.some(opt => opt.toLowerCase() === row[col.key].toString().toLowerCase())) {
            rowErrors.push(`${col.label} must be one of: ${col.options.join(", ")}`);
          }
        }
      });
      
      if (rowErrors.length > 0) {
        errors.push({ row: idx + 2, errors: rowErrors }); // +2 for 1-indexed and header row
      }
    });
    
    return errors;
  }, [columns]);

  // Handle file drop/select
  const handleFile = useCallback((selectedFile: File) => {
    if (!selectedFile.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }
    
    setFile(selectedFile);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const data = parseCSV(text);
      setParsedData(data);
      
      const errors = validateData(data);
      setValidationErrors(errors);
      
      if (data.length === 0) {
        toast.error("No valid data found in the file");
      } else if (errors.length > 0) {
        toast.warning(`Found ${errors.length} rows with validation errors`);
        setActiveTab("preview");
      } else {
        toast.success(`${data.length} records ready for import`);
        setActiveTab("preview");
      }
    };
    
    reader.readAsText(selectedFile);
  }, [parseCSV, validateData]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  // Handle upload
  const handleUpload = async () => {
    if (validationErrors.length > 0) {
      toast.error("Please fix validation errors before uploading");
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setActiveTab("results");
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      const results = await onUpload(parsedData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadResults(results);
      
      const successCount = results.filter(r => r.status === "success").length;
      const errorCount = results.filter(r => r.status === "error").length;
      
      if (errorCount === 0) {
        toast.success(`Successfully imported ${successCount} records!`);
      } else {
        toast.warning(`Imported ${successCount} records, ${errorCount} failed`);
      }
      
      onComplete?.();
    } catch (error) {
      toast.error("Upload failed. Please try again.");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  // Reset state
  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setValidationErrors([]);
    setUploadResults([]);
    setUploadProgress(0);
    setActiveTab("upload");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetState();
    }}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Bulk Upload
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon || <FileSpreadsheet className="h-5 w-5 text-green-600" />}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" disabled={isUploading}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={!file || isUploading}>
              <Eye className="h-4 w-4 mr-2" />
              Preview ({parsedData.length})
            </TabsTrigger>
            <TabsTrigger value="results" disabled={uploadResults.length === 0}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Results
            </TabsTrigger>
          </TabsList>
          
          {/* Upload Tab */}
          <TabsContent value="upload" className="flex-1 overflow-auto space-y-4">
            {/* Template Download */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                      <FileSpreadsheet className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Download Template</h3>
                      <p className="text-sm text-muted-foreground">
                        Use our CSV template to ensure correct formatting
                      </p>
                    </div>
                  </div>
                  <Button onClick={generateTemplate} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Drop Zone */}
            <Card 
              className={`border-2 border-dashed transition-colors ${
                dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <CardContent className="py-12 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-full bg-primary/10">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Drag and drop your CSV file here</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        or click to browse files
                      </p>
                    </div>
                    <Button variant="secondary" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Select CSV File
                    </Button>
                  </div>
                </label>
              </CardContent>
            </Card>

            {/* Column Requirements */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Required Columns</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {columns.map(col => (
                    <div key={col.key} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                      {col.required ? (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Optional</Badge>
                      )}
                      <span className="text-sm font-medium">{col.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* Validation Summary */}
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {validationErrors.length} row(s) have validation errors. Please fix them before uploading.
                </AlertDescription>
              </Alert>
            )}
            
            {file && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{parsedData.length} records found</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={resetState}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {/* Data Preview Table */}
            <ScrollArea className="flex-1 border rounded-lg">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="w-20">Status</TableHead>
                    {columns.slice(0, 5).map(col => (
                      <TableHead key={col.key}>{col.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 50).map((row, idx) => {
                    const rowError = validationErrors.find(e => e.row === idx + 2);
                    return (
                      <TableRow key={idx} className={rowError ? "bg-red-50 dark:bg-red-950" : ""}>
                        <TableCell className="font-mono text-sm">{idx + 1}</TableCell>
                        <TableCell>
                          {rowError ? (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Error
                            </Badge>
                          ) : (
                            <Badge className="gap-1 bg-green-100 text-green-800">
                              <CheckCircle2 className="h-3 w-3" />
                              Valid
                            </Badge>
                          )}
                        </TableCell>
                        {columns.slice(0, 5).map(col => (
                          <TableCell key={col.key} className="max-w-[200px] truncate">
                            {row[col.key] || "-"}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {parsedData.length > 50 && (
                <div className="p-4 text-center text-muted-foreground">
                  Showing first 50 of {parsedData.length} records
                </div>
              )}
            </ScrollArea>
            
            {/* Validation Errors List */}
            {validationErrors.length > 0 && (
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-2 text-red-600">Validation Errors</h4>
                  <ScrollArea className="h-32">
                    {validationErrors.map((error, idx) => (
                      <div key={idx} className="text-sm py-1">
                        <span className="font-medium">Row {error.row}:</span>{" "}
                        {error.errors.join("; ")}
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="flex-1 overflow-hidden flex flex-col space-y-4">
            {isUploading && (
              <Card>
                <CardContent className="py-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="font-semibold mb-2">Uploading data...</p>
                  <Progress value={uploadProgress} className="max-w-md mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">{uploadProgress}% complete</p>
                </CardContent>
              </Card>
            )}
            
            {!isUploading && uploadResults.length > 0 && (
              <>
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-green-50 dark:bg-green-950">
                    <CardContent className="pt-4 text-center">
                      <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-700">
                        {uploadResults.filter(r => r.status === "success").length}
                      </p>
                      <p className="text-sm text-green-600">Successful</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-amber-50 dark:bg-amber-950">
                    <CardContent className="pt-4 text-center">
                      <AlertCircle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-amber-700">
                        {uploadResults.filter(r => r.status === "warning").length}
                      </p>
                      <p className="text-sm text-amber-600">Warnings</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-red-50 dark:bg-red-950">
                    <CardContent className="pt-4 text-center">
                      <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-red-700">
                        {uploadResults.filter(r => r.status === "error").length}
                      </p>
                      <p className="text-sm text-red-600">Failed</p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Results Table */}
                <ScrollArea className="flex-1 border rounded-lg">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead className="w-16">Row</TableHead>
                        <TableHead className="w-24">Status</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uploadResults.map((result, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono">{result.row}</TableCell>
                          <TableCell>
                            <Badge className={
                              result.status === "success" ? "bg-green-100 text-green-800" :
                              result.status === "warning" ? "bg-amber-100 text-amber-800" :
                              "bg-red-100 text-red-800"
                            }>
                              {result.status === "success" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                              {result.status === "warning" && <AlertCircle className="h-3 w-3 mr-1" />}
                              {result.status === "error" && <XCircle className="h-3 w-3 mr-1" />}
                              {result.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{result.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-4">
          {activeTab === "preview" && (
            <>
              <Button variant="outline" onClick={resetState} className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Start Over
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={validationErrors.length > 0 || parsedData.length === 0}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Import {parsedData.length} Records
              </Button>
            </>
          )}
          {activeTab === "results" && !isUploading && (
            <Button onClick={() => setIsOpen(false)}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
