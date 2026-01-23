"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";
import {
  Printer,
  Upload,
  FileText,
  ArrowLeft,
  CheckCircle2,
  Settings,
  Palette,
  FileImage,
  Zap,
  Shield,
  Clock,
  X,
  Cloud
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { CustomSelect } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { PageLoader } from "@/components/ui/Spinner";

type Vendor = {
  id: string;
  shopName: string;
};

export default function CreateJobClient() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorId, setVendorId] = useState("");
  const [copies, setCopies] = useState(1);
  const [colorMode, setColorMode] = useState("BLACK_WHITE");
  const [paperSize, setPaperSize] = useState("A4");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    apiFetch<{ vendors: Vendor[] }>("/vendors/public")
      .then((res) => setVendors(res.vendors))
      .catch(() =>
        setVendors([
          { id: "TEMP_VENDOR_ID", shopName: "Demo Print Shop" },
        ])
      );
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file || !vendorId || copies <= 0) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const form = new FormData();
      form.append("file", file);
      form.append("vendorId", vendorId);
      form.append("copies", String(copies));
      form.append("colorMode", colorMode);
      form.append("paperSize", paperSize);

      await apiFetch("/print-jobs", {
        method: "POST",
        body: form,
      });

      router.replace("/user/jobs");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      if (allowedTypes.includes(selectedFile.type) || selectedFile.name.match(/\.(pdf|doc|docx|png|jpg|jpeg)$/i)) {
        setFile(selectedFile);
        setFileName(selectedFile.name);
        setError(null); // Clear any previous error
      } else {
        setError("Please select a valid file type (PDF, DOC, DOCX, PNG, JPG)");
        setFile(null);
        setFileName("");
        // Reset the input
        e.target.value = '';
      }
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const selectedFile = droppedFiles[0];
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      if (allowedTypes.includes(selectedFile.type) || selectedFile.name.match(/\.(pdf|doc|docx|png|jpg|jpeg)$/i)) {
        setFile(selectedFile);
        setFileName(selectedFile.name);
        setError(null); // Clear any previous error
      } else {
        setError("Please select a valid file type (PDF, DOC, DOCX, PNG, JPG)");
        setFile(null);
        setFileName("");
      }
    }
  }

  function removeFile() {
    setFile(null);
    setFileName("");
    setError(null);
    // Reset the file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  if (vendors.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading print shops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 -ml-2 px-2 sm:px-3"
            >
              <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Printer className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">Create Print Job</h1>
                <p className="text-xs text-gray-600">Upload and configure your document</p>
              </div>
            </div>
            <div className="w-20 sm:w-24"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md">
                <CardHeader className="border-b border-gray-100 pb-3 sm:pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg">Upload Document</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Choose your file to print</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-4 sm:p-8 text-center transition-all duration-300 ${
                      isDragOver
                        ? 'border-blue-500 bg-blue-50 scale-105'
                        : file
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-300 hover:border-blue-400 bg-gray-50/50 hover:bg-blue-50/30'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      ref={fileInputRef}
                    />

                    {file ? (
                      <div className="flex flex-col items-center gap-3 sm:gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-2xl flex items-center justify-center shadow-lg">
                            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                          </div>
                          <button
                            onClick={removeFile}
                            className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900 text-sm sm:text-lg">{fileName}</p>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            {(file.size / 1024 / 1024).toFixed(2)} MB • Tap to change
                          </p>
                        </div>
                      </div>
                    ) : (
                      <label htmlFor="file-upload" className="cursor-pointer block">
                        <div className="flex flex-col items-center gap-3 sm:gap-6">
                          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                            isDragOver ? 'bg-blue-200 scale-110' : 'bg-blue-100'
                          }`}>
                            {isDragOver ? (
                              <Cloud className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
                            ) : (
                              <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm sm:text-xl mb-1 sm:mb-2">
                              {isDragOver ? 'Drop your file here' : 'Drag & drop or tap to browse'}
                            </p>
                            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500">
                              <span className="bg-white px-2 py-1 rounded-full border text-xs sm:text-sm">PDF</span>
                              <span className="bg-white px-2 py-1 rounded-full border text-xs sm:text-sm">DOC</span>
                              <span className="bg-white px-2 py-1 rounded-full border text-xs sm:text-sm">DOCX</span>
                              <span className="bg-white px-2 py-1 rounded-full border text-xs sm:text-sm">PNG</span>
                              <span className="bg-white px-2 py-1 rounded-full border text-xs sm:text-sm">JPG</span>
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-400 mt-2 sm:mt-3">Max: 10MB</p>
                          </div>
                        </div>
                      </label>
                    )}

                    {isDragOver && (
                      <div className="absolute inset-0 bg-blue-500/10 rounded-xl flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 sm:px-6 sm:py-3 shadow-lg">
                          <Cloud className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-1 sm:mb-2" />
                          <p className="text-blue-700 font-semibold text-xs sm:text-sm">Release to upload</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md">
                <CardHeader className="border-b border-gray-100 pb-3 sm:pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg">Print Settings</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Configure your print preferences</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Printer className="h-4 w-4 text-gray-500" />
                        Print Shop
                      </label>
                      <CustomSelect
                        value={vendorId}
                        onChange={(e) => setVendorId(e.target.value)}
                        options={vendors.map((v) => ({ value: v.id, label: v.shopName }))}
                        placeholder="Choose a shop"
                        error={!vendorId && error ? "Please select a vendor" : undefined}
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        Copies
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={copies}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCopies(Number(e.target.value))}
                        className="text-center text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Palette className="h-4 w-4 text-gray-500" />
                        Color Mode
                      </label>
                      <CustomSelect
                        value={colorMode}
                        onChange={(e) => setColorMode(e.target.value)}
                        options={[
                          { value: "BLACK_WHITE", label: "Black & White" },
                          { value: "COLOR", label: "Full Color" },
                        ]}
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FileImage className="h-4 w-4 text-gray-500" />
                        Paper Size
                      </label>
                      <CustomSelect
                        value={paperSize}
                        onChange={(e) => setPaperSize(e.target.value)}
                        options={[
                          { value: "A4", label: "A4 (Standard)" },
                          { value: "A3", label: "A3 (Large)" },
                        ]}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {error && (
                <Alert variant="error" className="border-red-200 bg-red-50">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    </div>
                    {error}
                  </div>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loading || !file || !vendorId}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 sm:py-4 text-sm sm:text-base shadow-lg"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent mr-2 sm:mr-3"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                    Create Print Job
                  </>
                )}
              </Button>
            </form>
          </div>

          <div className="space-y-4 sm:space-y-6 lg:sticky lg:top-24 lg:h-fit">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-sm sm:text-lg text-blue-900">Print Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-4 pt-0">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs sm:text-sm">Copies</span>
                  <span className="font-semibold text-blue-900 text-sm sm:text-base">{copies}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs sm:text-sm">Color Mode</span>
                  <span className="font-semibold text-blue-900 text-sm sm:text-base">
                    {colorMode === "COLOR" ? "Full Color" : "B&W"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs sm:text-sm">Paper Size</span>
                  <span className="font-semibold text-blue-900 text-sm sm:text-base">{paperSize}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs sm:text-sm">Print Shop</span>
                  <span className="font-semibold text-blue-900 text-xs sm:text-base truncate max-w-[120px] sm:max-w-none">
                    {vendors.find(v => v.id === vendorId)?.shopName || "Not selected"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-md">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-sm sm:text-lg">Why Choose Us?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 pt-0">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-xs sm:text-sm">Secure & Private</p>
                    <p className="text-xs text-gray-600">Documents handled with confidentiality</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-xs sm:text-sm">Fast Service</p>
                    <p className="text-xs text-gray-600">Ready in minutes, not hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-xs sm:text-sm">Quality Prints</p>
                    <p className="text-xs text-gray-600">Professional quality guaranteed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Need Help?</h3>
                <p className="text-xs text-gray-600 mb-3">
                  Questions about printing options?
                </p>
                <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}