"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  DollarSign,
  Download,
  Key,
  Copy,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge, formatStatus } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Input";
import { PageLoader } from "@/components/ui/Spinner";

function calculatePrice(copies: number, colorMode: string, paperSize: string) {
  let rate = 0;

  if (colorMode === "BLACK_WHITE") {
    rate = paperSize === "A3" ? 5 : 2;
  } else {
    rate = paperSize === "A3" ? 10 : 5;
  }

  const base = copies * rate;
  return { base, min: base, max: base * 2 };
}

type Job = {
  id: string;
  copies: number;
  colorMode: string;
  paperSize: string;
  status: string;
  price: number | null;
  priceAccepted: boolean;
  pickupOtp?: { id: string };
  user: { phone: string };
  payment?: {
    status: "INITIATED" | "PAID" | "REFUND_PENDING" | "REFUNDED" | "CANCELLED";
    method: "ONLINE" | "OFFLINE";
  };
  createdAt: string;
};

export default function VendorJobDetailClient({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<Job | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [pickupOtp, setPickupOtp] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  async function loadJob() {
    const res = await apiFetch<{ job: Job }>(`/print-jobs/vendor/${jobId}`);
    setJob(res.job);
    if (res.job.price !== null) setPrice(res.job.price);
  }

  useEffect(() => {
    loadJob().catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [jobId]);

  async function submitPrice() {
    if (price === null) return;
    try {
      await apiFetch(`/print-jobs/${jobId}/set-price`, {
        method: "POST",
        body: JSON.stringify({ price }),
      });
      await loadJob();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function verifyPickupOtp() {
    if (!pickupOtp || pickupOtp.length !== 6) {
      setError("Enter valid 6-digit OTP");
      return;
    }

    try {
      setVerifying(true);

      await apiFetch(`/print-jobs/${jobId}/verify-pickup`, {
        method: "POST",
        body: JSON.stringify({ otp: pickupOtp }),
      });

      setError(null);
      alert("Pickup verified. Job completed.");

      const refreshed = await apiFetch<{ job: Job }>(
        `/print-jobs/vendor/${jobId}`
      );
      setJob(refreshed.job);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  }

  async function markReady() {
    try {
      await apiFetch(`/print-jobs/${jobId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "READY" }),
      });
      await loadJob();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function generateOtp() {
    try {
      const res = await apiFetch<{ otp?: string }>(
        `/print-jobs/${jobId}/pickup-otp`,
        { method: "POST" }
      );

      if (res.otp) {
        setDevOtp(res.otp);
        alert(`DEV PICKUP OTP: ${res.otp}`);
      }
      await loadJob();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function downloadFile() {
    try {
      const res = await apiFetch<{
        downloadUrl: string;
      }>(`/print-jobs/${jobId}/file`);

      window.open(res.downloadUrl, "_blank");
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-cream-100 flex items-center justify-center relative">
        <Link href="/" className="absolute top-4 left-4">
          <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-blue-300">
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Button>
        </Link>
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-tomato-100 to-deepOrange-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Printer className="w-12 h-12 text-tomato-500 animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-tomato-500 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-deepOrange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <h2 className="text-2xl font-bold text-charcoal-900 mb-2">Loading Job Details</h2>
          <p className="text-lg text-charcoal-600 animate-pulse">Fetching job information...</p>
          <div className="mt-6 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-tomato-400 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-deepOrange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-tomato-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream-50 p-6">
        <div className="max-w-md mx-auto">
          <Alert variant="error" title="Error Loading Job">
            <p className="text-charcoal-700">{error}</p>
            <div className="flex gap-3 mt-4">
              <Button onClick={() => window.location.reload()} variant="outline" className="border-gray-200">
                Try Again
              </Button>
              <Button onClick={() => window.location.href = "/vendor/jobs"} variant="danger" className="bg-red-500 hover:bg-red-600">
                Back to Jobs
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  if (!job) return null;

  // Clear error when user interacts
  const handleInteraction = () => setError(null);

  const pricing = calculatePrice(job.copies, job.colorMode, job.paperSize);

  if (job.status === "COMPLETED") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-cream-100">
        <div className="max-w-2xl mx-auto py-12">
          <Card className="bg-gradient-to-br from-white to-success-50/30 border-0 shadow-xl">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-success-100 to-success-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle2 className="w-10 h-10 text-success-600" />
              </div>
              <h2 className="text-3xl font-bold text-charcoal-900 mb-2">Job Completed Successfully</h2>
              <p className="text-charcoal-600 text-lg">
                This print job has been delivered and picked up by the customer.
              </p>
              <div className="mt-8">
                <Button
                  onClick={() => window.location.href = "/vendor/jobs"}
                  className="bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white shadow-lg"
                >
                  Back to All Jobs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-cream-100">
      <div className="bg-white/90 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
            <div className="flex items-center gap-5">
              <Button
                onClick={() => window.location.href = "/vendor/jobs"}
                variant="ghost"
                className="p-2 hover:bg-cream-100"
              >
                <ArrowLeft className="w-5 h-5 text-charcoal-600" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-charcoal-900 mb-1">
                  Job #{job.id.slice(0, 8)}
                </h1>
                <p className="text-charcoal-600 text-lg">
                  Customer: +91 {job.user.phone}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={
                job.status === "COMPLETED" ? "success" :
                job.status === "CANCELLED" ? "danger" :
                job.status === "READY" ? "info" : "warning"
              } size="lg" className="px-4 py-2">
                {formatStatus(job.status)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {error && (
            <Alert variant="error" title="Error">
              <p className="text-charcoal-700">{error}</p>
            </Alert>
          )}

      <Card>
        <CardHeader>
          <CardTitle>Job Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-500">Copies</p>
              <p className="text-xl font-bold text-gray-900">{job.copies}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-500">Color</p>
              <p className="text-xl font-bold text-gray-900">
                {job.colorMode === "BLACK_WHITE" ? "B&W" : "Color"}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-500">Size</p>
              <p className="text-xl font-bold text-gray-900">{job.paperSize}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Created: {new Date(job.createdAt).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      {job.price === null ? (
        <Card>
          <CardHeader>
            <CardTitle>Set Price</CardTitle>
            <CardDescription>
              Suggested: ₹{pricing.base} (Range: ₹{pricing.min} - ₹{pricing.max})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                type="number"
                min={pricing.min}
                max={pricing.max}
                value={price ?? ""}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder={`Enter price (suggested: ₹${pricing.base})`}
              />
              <Button
                onClick={submitPrice}
                icon={<DollarSign className="w-4 h-4" />}
              >
                Set Price
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="text-2xl font-bold text-gray-900">₹{job.price}</p>
              </div>
              <Badge variant={job.priceAccepted ? "success" : "warning"}>
                {job.priceAccepted ? "Accepted by Customer" : "Waiting for Acceptance"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {job.status === "PENDING" && job.priceAccepted && job.payment?.status === "PAID" && (
        <div className="space-y-4">
          <Button
            onClick={downloadFile}
            className="w-full"
            variant="outline"
            icon={<Download className="w-4 h-4" />}
          >
            Download Print File
          </Button>

          <Button
            onClick={markReady}
            className="w-full"
            size="lg"
            icon={<Printer className="w-4 h-4" />}
          >
            Mark Ready for Pickup
          </Button>
        </div>
      )}

      {job.status === "READY" && (
        <Button
          onClick={downloadFile}
          className="w-full"
          icon={<Download className="w-4 h-4" />}
        >
          Download Print File
        </Button>
      )}

      {job.payment && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                job.payment.status === "PAID" ? "success" :
                job.payment.status === "REFUND_PENDING" ? "warning" :
                job.payment.status === "REFUNDED" ? "success" :
                job.payment.status === "CANCELLED" ? "danger" : "neutral"
              }
              size="md"
            >
              {formatStatus(job.payment.status)} ({job.payment.method})
            </Badge>
          </CardContent>
        </Card>
      )}

      {job.status === "READY" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Pickup Verification
            </CardTitle>
            <CardDescription>
              Enter the OTP provided by the customer to complete the job
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!job.pickupOtp && (
              <Button 
                onClick={generateOtp}
                variant="secondary"
                className="w-full"
                icon={<Key className="w-4 h-4" />}
              >
                Generate Pickup OTP
              </Button>
            )}

            {devOtp && (
              <Alert variant="info" title="Development OTP">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold">{devOtp}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(devOtp)}
                    icon={<Copy className="w-4 h-4" />}
                  >
                    Copy
                  </Button>
                </div>
              </Alert>
            )}

            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={pickupOtp}
                onChange={(e) => setPickupOtp(e.target.value)}
                maxLength={6}
              />
              <Button 
                onClick={verifyPickupOtp}
                disabled={verifying || pickupOtp.length !== 6}
                icon={verifying ? undefined : <CheckCircle2 className="w-4 h-4" />}
              >
                {verifying ? "Verifying..." : "Verify & Complete"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {job.status === "COMPLETED" && (
        <Alert variant="success" title="Job Completed">
          This print job has been successfully completed and picked up.
        </Alert>
      )}
        </div>
      </div>
    </div>
  );
}