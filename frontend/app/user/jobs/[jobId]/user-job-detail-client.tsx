"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  XCircle,
  CreditCard,
  Copy,
  Check,
  FileText,
  Hash,
  Palette,
  Calendar,
  DollarSign,
  Clock,
  Truck,
  MapPin,
  AlertTriangle,
  Wallet,
  Sparkles,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge, formatStatus } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { PageLoader } from "@/components/ui/Spinner";

type Job = {
  id: string;
  status: "PENDING" | "READY" | "COMPLETED" | "CANCELLED";
  copies: number;
  colorMode: string;
  paperSize: string;
  price: number | null;
  priceAccepted: boolean;
  createdAt: string;
  vendor: {
    shopName: string;
  };

  payment?: {
    status:
      | "INITIATED"
      | "PAID"
      | "REFUND_PENDING"
      | "REFUNDED"
      | "CANCELLED";
    method?: "ONLINE" | "OFFLINE";
  } | null;

  pickupOtp?: {
    otp: string;
  } | null;
};

export default function UserJobDetailClient() {
  const params = useParams<{ jobId: string }>();
  const { jobId } = params;
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payingOffline, setPayingOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpCopied, setOtpCopied] = useState(false);

  useEffect(() => {
    async function loadJob() {
      try {
        const res = await apiFetch<{ job: Job }>(`/print-jobs/${jobId}`);
        setJob(res.job);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  async function acceptPrice() {
    if (!job) return;

    try {
      await apiFetch(`/print-jobs/${job.id}/accept-price`, { method: "POST" });
      setJob({ ...job, priceAccepted: true });
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function cancelJob() {
    if (!job) return;

    try {
      await apiFetch(`/print-jobs/${job.id}/cancel`, { method: "POST" });
      const refreshed = await apiFetch<{ job: Job }>(`/print-jobs/${job.id}`);
      setJob(refreshed.job);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function payOnline() {
    if (!job) return;

    try {
      setPaying(true);
      setError(null);

      await apiFetch(`/print-jobs/${job.id}/pay`, {
        method: "POST",
        body: JSON.stringify({
          method: "ONLINE",
          idempotencyKey: crypto.randomUUID(),
        }),
      });

      await apiFetch(`/print-jobs/${job.id}/mock-pay-success`, {
        method: "POST",
      });

      const refreshed = await apiFetch<{ job: Job }>(`/print-jobs/${job.id}`);
      setJob(refreshed.job);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPaying(false);
    }
  }

  async function payOffline() {
    if (!job) return;

    try {
      setPayingOffline(true);
      setError(null);

      await apiFetch(`/print-jobs/${job.id}/pay`, {
        method: "POST",
        body: JSON.stringify({
          method: "OFFLINE",
          idempotencyKey: crypto.randomUUID(),
        }),
      });

      await apiFetch(`/print-jobs/${job.id}/mock-pay-success`, {
        method: "POST",
      });

      const refreshed = await apiFetch<{ job: Job }>(`/print-jobs/${job.id}`);
      setJob(refreshed.job);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPayingOffline(false);
    }
  }

  function copyOtp() {
    if (job?.pickupOtp?.otp) {
      navigator.clipboard.writeText(job.pickupOtp.otp);
      setOtpCopied(true);
      setTimeout(() => setOtpCopied(false), 2000);
    }
  }

  if (loading) {
    return <PageLoader text="Loading job details..." />;
  }

  if (!job || error) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
        <Alert variant="error" title="Error" className="max-w-md">
          {error || "Job not found"}
        </Alert>
      </div>
    );
  }

  const canCancel = job.status !== "COMPLETED" && 
                    job.status !== "CANCELLED" && 
                    !job.pickupOtp;

  const statusVariant = job.status === "COMPLETED" ? "success" :
                        job.status === "CANCELLED" ? "danger" :
                        job.status === "READY" ? "info" : "warning";

  const statusColors: Record<string, string> = {
    PENDING: "bg-warning-100 text-warning-700",
    READY: "bg-info-100 text-info-700",
    COMPLETED: "bg-success-100 text-success-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-charcoal-600 hover:text-tomato-600 hover:bg-tomato-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>

        <Card className="bg-white border-0 shadow-card mb-6 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-tomato-500 to-deepOrange-500"></div>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-tomato-500 to-deepOrange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-tomato-200">
                  <Printer className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-charcoal-900">
                      Job #{job.id.slice(0, 8)}
                    </h1>
                    <Badge variant={statusVariant} className="text-xs">
                      {formatStatus(job.status)}
                    </Badge>
                  </div>
                  <p className="text-charcoal-600 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.vendor.shopName}
                  </p>
                </div>
              </div>
              {job.price !== null && (
                <div className="text-right">
                  <p className="text-sm text-charcoal-500">Total Price</p>
                  <p className="text-3xl font-bold text-charcoal-900">₹{job.price}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="bg-white border-0 shadow-card lg:col-span-2">
            <CardHeader className="pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-tomato-50 rounded-xl flex items-center justify-center text-tomato-500">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg text-charcoal-900">Job Details</CardTitle>
                  <CardDescription className="text-charcoal-500">Specifications and requirements</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-tomato-50 rounded-xl p-4 border border-tomato-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Hash className="w-5 h-5 text-tomato-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-tomato-600 uppercase tracking-wide">Copies</p>
                      <p className="text-2xl font-bold text-charcoal-900">{job.copies}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-success-50 rounded-xl p-4 border border-success-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Palette className="w-5 h-5 text-success-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-success-600 uppercase tracking-wide">Color Mode</p>
                      <p className="text-lg font-bold text-charcoal-900">
                        {job.colorMode === "BLACK_WHITE" ? "B&W" : "Color"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-info-50 rounded-xl p-4 border border-info-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <FileText className="w-5 h-5 text-info-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-info-600 uppercase tracking-wide">Paper Size</p>
                      <p className="text-lg font-bold text-charcoal-900">{job.paperSize}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-warning-50 rounded-xl p-4 border border-warning-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <Calendar className="w-5 h-5 text-warning-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-warning-600 uppercase tracking-wide">Ordered On</p>
                      <p className="text-lg font-bold text-charcoal-900">
                        {new Date(job.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {job.price !== null && (
              <Card className={`border-0 shadow-card ${
                job.priceAccepted ? 'bg-gradient-to-br from-success-500 to-success-600' : 'bg-gradient-to-br from-tomato-500 to-deepOrange-500'
              } text-white`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-white/80 text-sm">Total Price</p>
                        <p className="text-3xl font-bold">₹{job.price}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${
                      job.priceAccepted ? 'bg-white/20 text-white' : 'bg-white text-tomato-600'
                    }`}>
                      {job.priceAccepted ? "✓ Price Accepted" : "⏳ Awaiting Acceptance"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {job.payment && (
              <Card className="bg-white border-0 shadow-card">
                <CardHeader className="pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-info-50 rounded-xl flex items-center justify-center text-info-500">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-charcoal-900">Payment</CardTitle>
                      <CardDescription className="text-charcoal-500">Current status</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        job.payment.status === "PAID" ? "bg-success-500" :
                        job.payment.status === "REFUND_PENDING" ? "bg-warning-500" :
                        job.payment.status === "REFUNDED" ? "bg-success-500" :
                        job.payment.status === "CANCELLED" ? "bg-red-500" : "bg-gray-400"
                      }`}></div>
                      <span className="font-semibold text-charcoal-900">
                        {job.payment.status === "PAID" ? "Paid" : "Not Paid"}
                      </span>
                    </div>
                    <Badge variant={
                      job.payment.status === "PAID" ? "success" :
                      job.payment.status === "REFUND_PENDING" ? "warning" :
                      job.payment.status === "REFUNDED" ? "success" :
                      job.payment.status === "CANCELLED" ? "danger" : "neutral"
                    }>
                      {job.payment.status}
                    </Badge>
                  </div>

                  {job.payment.status === "REFUND_PENDING" && (
                    <Alert variant="warning" title="Refund Pending" className="mt-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Your refund is being processed (3-5 days)</span>
                      </div>
                    </Alert>
                  )}

                  {job.payment.status === "REFUNDED" && (
                    <Alert variant="success" title="Refunded" className="mt-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Refund completed successfully</span>
                      </div>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {job.status === "READY" && job.pickupOtp && (
          <Card className="bg-white border-0 shadow-card mb-6 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-success-500 to-success-600"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-success-100 rounded-2xl flex items-center justify-center text-success-500">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl text-charcoal-900">Ready for Pickup!</CardTitle>
                  <CardDescription className="text-charcoal-500">
                    Show this code to collect your prints
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-1 w-full">
                  <div className="bg-gradient-to-br from-charcoal-900 to-charcoal-800 rounded-2xl p-8 text-center">
                    <p className="text-5xl font-mono font-bold text-white tracking-widest mb-2">
                      {job.pickupOtp.otp}
                    </p>
                    <p className="text-white/60 text-sm font-medium uppercase tracking-wide">Pickup Code</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:w-auto w-full">
                  <Button
                    variant={otpCopied ? "success" : "primary"}
                    onClick={copyOtp}
                    className="sm:w-auto w-full"
                  >
                    {otpCopied ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 mr-2" />
                        Copy Code
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-charcoal-500 text-center">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Valid for 5 minutes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {job.status === "PENDING" && job.price !== null && !job.priceAccepted && (
          <Card className="bg-white border-0 shadow-card mb-6 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-info-500 to-info-600"></div>
            <CardContent className="p-8">
              <div className="text-center max-w-md mx-auto">
                <div className="w-20 h-20 bg-info-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-info-500" />
                </div>
                <h3 className="text-2xl font-bold text-charcoal-900 mb-2">Price Quote Ready!</h3>
                <p className="text-charcoal-600 mb-6">
                  Review the price and accept to proceed with your print job.
                </p>
                <div className="bg-cream-50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-charcoal-500 mb-1">Total Price</p>
                  <p className="text-3xl font-bold text-charcoal-900">₹{job.price}</p>
                </div>
                <Button
                  onClick={acceptPrice}
                  className="bg-gradient-to-r from-info-500 to-info-600 hover:from-info-600 hover:to-info-700 text-white shadow-lg shadow-info-200 w-full"
                  icon={<CheckCircle2 className="w-5 h-5" />}
                >
                  Accept & Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {job.status === "PENDING" && job.priceAccepted && (
          <Card className="bg-white border-0 shadow-card mb-6 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-success-500 to-deepOrange-500"></div>
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-tomato-500 to-deepOrange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-tomato-200">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-charcoal-900 mb-2">How would you like to pay?</h3>
                <p className="text-charcoal-600">Choose your preferred payment method</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <Button
                  onClick={payOnline}
                  disabled={paying}
                  size="lg"
                  className="bg-gradient-to-r from-tomato-500 to-deepOrange-500 hover:from-tomato-600 hover:to-deepOrange-600 text-white shadow-lg shadow-tomato-200 h-16 text-lg"
                >
                  {paying ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-6 h-6 mr-3" />
                      Pay Online
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={payOffline}
                  disabled={payingOffline}
                  size="lg"
                  className="border-2 border-gray-200 text-charcoal-700 hover:border-tomato-300 hover:bg-tomato-50 hover:text-tomato-700 h-16 text-lg"
                >
                  {payingOffline ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-6 h-6 mr-3" />
                      Pay Offline
                    </>
                  )}
                </Button>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-charcoal-500">
                  {paying ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Redirecting to secure payment...
                    </span>
                  ) : payingOffline ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Recording your offline payment...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4 text-tomato-500" />
                      Secure payment powered by InstaPrint
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {job.status === "COMPLETED" && (
          <Card className="bg-white border-0 shadow-card mb-6 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-success-500 to-success-600"></div>
            <CardContent className="p-8">
              <div className="text-center max-w-md mx-auto">
                <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-success-500" />
                </div>
                <h3 className="text-2xl font-bold text-charcoal-900 mb-2">Job Completed! 🎉</h3>
                <p className="text-charcoal-600 mb-6">
                  Your print job has been completed and picked up. Thank you for using InstaPrint!
                </p>
                <Button
                  onClick={() => router.push("/user/jobs")}
                  variant="outline"
                  className="border-gray-200 text-charcoal-700 hover:border-tomato-300 hover:text-tomato-600"
                >
                  View All Jobs
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {canCancel && (
          <Card className="bg-white border-0 shadow-card mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal-900">Need to cancel?</p>
                    <p className="text-sm text-charcoal-500">You can cancel this job anytime</p>
                  </div>
                </div>
                <Button
                  variant="danger"
                  onClick={cancelJob}
                  className="bg-red-500 hover:bg-red-600 text-white"
                  icon={<XCircle className="w-5 h-5" />}
                >
                  Cancel Job
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center pb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/user/jobs")}
            className="text-charcoal-600 hover:text-tomato-600 hover:bg-tomato-50"
          >
            View All Your Jobs
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}