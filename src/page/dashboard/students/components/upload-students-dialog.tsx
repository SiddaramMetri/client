import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { FileUploader } from "react-drag-drop-files";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { downloadStudentTemplateService, uploadStudentExcelService, StudentUploadResult } from "@/services/student.service";
import ClassLookupDialog from "./class-lookup-dialog";

interface UploadStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (results: StudentUploadResult) => void;
}

export default function UploadStudentsDialog({
  open,
  onOpenChange,
  onSuccess,
}: UploadStudentsDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<StudentUploadResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [classLookupOpen, setClassLookupOpen] = useState(false);
  const { toast } = useToast();

  const fileTypes = ["xlsx", "xls"];

  const handleFileChange = (file: File) => {
    setFile(file);
    setError(null);
    setUploadResult(null);
    setUploadProgress(0);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Show initial progress
      setUploadProgress(10);
      
      // Update progress at intervals to show activity
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          // Don't go past 90% until we get the actual response
          return prev < 90 ? prev + 5 : prev;
        });
      }, 300);

      // Make the actual API call
      const response = await uploadStudentExcelService(file);

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Set the upload result
      setUploadResult(response.results);

      toast({
        title: "Upload Successful",
        description: `Processed ${response.results.success} students with ${response.results.failed} failures`,
      });

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess(response.results);
      }
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'An unknown error occurred during upload';
        
      setError(errorMessage);
      toast({
        variant: "error",
        title: "Upload Failed",
        description: errorMessage,
      });
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      // Start the download using a direct blob approach
      const blobData = await downloadStudentTemplateService();
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blobData);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "student_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: "Template Downloaded",
        description: "Student template has been downloaded successfully"
      });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to download template';
        
      toast({
        variant: "error",
        title: "Download Failed",
        description: errorMessage,
      });
    }
  };

  const handleClose = () => {
    setFile(null);
    setError(null);
    setUploadResult(null);
    setUploadProgress(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Upload Student Data
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file with student data. Download the template if you
            haven't already.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Helpful tips to prevent common errors */}
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-sm text-blue-700">
              <p><strong>Important tips for Excel upload:</strong></p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Use the template for proper column formatting (see Instructions tab)</li>
                <li>Date format must be <strong>YYYY-MM-DD</strong> (e.g., 2012-05-15)</li>
                <li>Gender must be one of: <strong>male</strong>, <strong>female</strong>, or <strong>other</strong></li>
                <li>Class ID must be a valid MongoDB ObjectId 
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => setClassLookupOpen(true)} 
                    className="p-0 h-auto font-normal underline text-blue-700 ml-1"
                  >
                    (lookup class IDs)
                  </Button>
                </li>
                <li><strong>Required fields:</strong> First name, Last name, Date of Birth, Gender, 
                  Class ID, Roll Number, Student Mobile, Father's Name, Primary Mobile</li>
              </ul>
            </AlertDescription>
          </Alert>
          <br/>
          {!uploadResult ? (
            <>
              <FileUploader
                handleChange={handleFileChange}
                name="file"
                types={fileTypes}
                maxSize={5}
                minSize={0}
              >
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-800 mb-2">
                    {file ? file.name : "Drag & Drop or Click to Upload"}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {file
                      ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                      : "Excel files only (.xlsx, .xls)"}
                  </p>
                  <p className="text-xs text-gray-500">Max file size: 5MB</p>
                </div>
              </FileUploader>

              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Uploading...</p>
                    <p className="text-sm font-medium">{uploadProgress}%</p>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </>
          ) : (
            <div className="border rounded-lg p-6 bg-gray-50">
              <div className="flex items-center justify-center gap-3 mb-4">
                {uploadResult.failed === 0 ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-amber-500" />
                )}
                <h3 className="text-lg font-medium">
                  {uploadResult.failed === 0 ? "Upload Successful" : "Upload Completed with Errors"}
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center mb-4">
                <div className="border rounded-md p-4 bg-green-50">
                  <p className="text-sm text-gray-600">Successfully Uploaded</p>
                  <p className="text-2xl font-bold text-green-600">
                    {uploadResult.success}
                  </p>
                </div>
                <div className={`border rounded-md p-4 ${uploadResult.failed > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <p className="text-sm text-gray-600">Failed Rows</p>
                  <p className={`text-2xl font-bold ${uploadResult.failed > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {uploadResult.failed}
                  </p>
                </div>
              </div>
              
              {uploadResult.failed > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2">Error Details:</h4>
                  <div className="max-h-40 overflow-y-auto border rounded bg-white p-2">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-1 text-left">Row</th>
                          <th className="px-2 py-1 text-left">Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadResult.errors.map((error, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-2 py-1 font-mono">{error.row}</td>
                            <td className="px-2 py-1 text-red-600">{error.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Fix these errors in your Excel file and try uploading again.
                  </p>
                </div>
              )}
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Errors:</p>
                  <div className="max-h-[150px] overflow-y-auto">
                    {uploadResult.errors.map((error, idx: number) => (
                      <div
                        key={idx}
                        className="text-xs bg-red-50 p-2 rounded mb-1 flex items-start gap-2"
                      >
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span>
                          <span className="font-medium">Row {error.row}:</span>{" "}
                          {error.error}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={uploading}
            type="button"
          >
            {uploadResult ? "Close" : "Cancel"}
          </Button>

          {!uploadResult && (
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleUpload}
                disabled={!file || uploading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          )}

          {uploadResult && (
            <Button
              onClick={() => {
                handleClose();
              }}
              className="bg-gradient-to-r from-green-600 to-emerald-600"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
      
      {/* Class Lookup Dialog */}
      <ClassLookupDialog 
        open={classLookupOpen}
        onOpenChange={setClassLookupOpen}
      />
    </Dialog>
  );
}
