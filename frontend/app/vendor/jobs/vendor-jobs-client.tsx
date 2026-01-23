"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { useRouter } from "next/navigation";
import {
  Printer,
  FileText,
  Clock,
  CheckCircle,
  Filter,
  ArrowRight,
  Store,
  Link,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge, formatStatus } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";

type Job = {
  id: string;
  status: "PENDING" | "READY" | "COMPLETED" | "CANCELLED";
  copies: number;
  colorMode: string;
  paperSize: string;
  price: number | null;
  priceAccepted: boolean;
  pickupOtp?: { id: string } | null;
  payment?: {
    status: "INITIATED" | "PAID" | "REFUND_PENDING" | "REFUNDED" | "CANCELLED";
    method: "ONLINE" | "OFFLINE";
  } | null;
  createdAt: string;
  user?: {
    phone: string;
    name: string | null;
  } | null;
};

type Vendor = {
  id: string;
  shopName: string;
  ownerName: string | null;
  phone: string;
};

type JobListResponse = {
  vendor: Vendor;
  jobs: Job[];
};

export default function VendorJobsClient() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await apiFetch<JobListResponse>("/print-jobs/vendor/my");
        setJobs(res.jobs || []);
      } catch (err: any) {
        setError(err.message || "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-cream-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-tomato-100 to-deepOrange-100 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-lg">
              <Store className="w-10 h-10 sm:w-12 sm:h-12 text-tomato-500 animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-tomato-500 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-1 -left-1 sm:-bottom-1 sm:-left-1 w-5 h-5 sm:w-6 sm:h-6 bg-deepOrange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 mb-2">Loading Jobs</h2>
          <p className="text-sm sm:text-base md:text-lg text-charcoal-600 animate-pulse">Fetching your print jobs...</p>
          <div className="mt-4 sm:mt-6 flex justify-center space-x-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-tomato-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-deepOrange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-tomato-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream-50 p-6">
        <div className="max-w-md mx-auto">
          <Alert variant="error" title="Error Loading Jobs">
            <p className="text-charcoal-700">{error}</p>
            <div className="flex gap-3 mt-4">
              <Button onClick={() => window.location.reload()} variant="outline" className="border-gray-200">
                Try Again
              </Button>
              <Button onClick={() => window.location.href = "/vendor/dashboard"} variant="danger" className="bg-red-500 hover:bg-red-600">
                Back to Dashboard
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  const filteredJobs = jobs.filter((job) => {
    if (filter === "active") {
      return !["COMPLETED", "CANCELLED"].includes(job.status);
    }
    if (filter === "completed") {
      return ["COMPLETED", "CANCELLED"].includes(job.status);
    }
    return true;
  });

  const activeCount = jobs.filter(j => !["COMPLETED", "CANCELLED"].includes(j.status)).length;
  const completedCount = jobs.filter(j => ["COMPLETED", "CANCELLED"].includes(j.status)).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "success";
      case "PENDING": return "warning";
      case "CANCELLED": return "danger";
      case "READY": return "info";
      default: return "neutral";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return <CheckCircle className="w-7 h-7" />;
      case "PENDING": return <Clock className="w-7 h-7" />;
      case "READY": return <Printer className="w-7 h-7" />;
      default: return <FileText className="w-7 h-7" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-cream-100">
      <div className="bg-white/90 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-charcoal-900 mb-1 sm:mb-2">
                  My Print Jobs
                </h1>
                <p className="text-charcoal-600 text-sm sm:text-lg max-w-md">
                  Manage and track all your print orders from customers.
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <Button
                  onClick={() => router.push("/vendor/dashboard")}
                  variant="outline"
                  className="flex-1 sm:flex-none border-gray-200 text-charcoal-600 hover:border-tomato-300 hover:text-tomato-600 hover:bg-tomato-50 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Dashboard</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-10">
          <Card
            className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
              filter === "all"
                ? "bg-gradient-to-br from-tomato-50 to-tomato-100 border-tomato-200 shadow-xl"
                : "bg-white hover:border-tomato-200 hover:shadow-lg"
            }`}
            onClick={() => setFilter("all")}
          >
            <CardContent className="p-3 sm:p-4 md:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-tomato-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-tomato-600" />
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-charcoal-900 mb-0.5 sm:mb-1">{jobs.length}</p>
              <p className="text-xs sm:text-sm font-medium text-charcoal-600">All Jobs</p>
              <p className="text-[10px] sm:text-xs text-charcoal-500 mt-0.5 sm:mt-1">Total orders</p>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
              filter === "active"
                ? "bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200 shadow-xl"
                : "bg-white hover:border-warning-200 hover:shadow-lg"
            }`}
            onClick={() => setFilter("active")}
          >
            <CardContent className="p-3 sm:p-4 md:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-warning-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-warning-600" />
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-charcoal-900 mb-0.5 sm:mb-1">{activeCount}</p>
              <p className="text-xs sm:text-sm font-medium text-charcoal-600">Active</p>
              <p className="text-[10px] sm:text-xs text-charcoal-500 mt-0.5 sm:mt-1">Needs attention</p>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
              filter === "completed"
                ? "bg-gradient-to-br from-success-50 to-success-100 border-success-200 shadow-xl"
                : "bg-white hover:border-success-200 hover:shadow-lg"
            }`}
            onClick={() => setFilter("completed")}
          >
            <CardContent className="p-3 sm:p-4 md:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-success-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success-600" />
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-charcoal-900 mb-0.5 sm:mb-1">{completedCount}</p>
              <p className="text-xs sm:text-sm font-medium text-charcoal-600">Completed</p>
              <p className="text-[10px] sm:text-xs text-charcoal-500 mt-0.5 sm:mt-1">Delivered</p>
            </CardContent>
          </Card>
        </div>

        {jobs.length === 0 ? (
          <Card className="bg-white border-0 shadow-xl">
            <CardContent className="py-8 sm:py-12 md:py-16 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 md:mb-6">
                <Printer className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-charcoal-300" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-charcoal-900 mb-2">No print jobs yet</h3>
              <p className="text-charcoal-600 mb-4 sm:mb-6 md:mb-8 max-w-md mx-auto text-xs sm:text-sm md:text-base">
                When customers create print jobs, they will appear here for you to manage and process.
              </p>
              <Button
                onClick={() => router.push("/vendor/dashboard")}
                className="bg-gradient-to-r from-tomato-500 to-deepOrange-500 hover:from-tomato-600 hover:to-deepOrange-600 text-white shadow-lg"
                icon={<ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />}
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : filteredJobs.length === 0 ? (
          <Card className="bg-white border-0 shadow-xl">
            <CardContent className="py-6 sm:py-10 md:py-12 text-center">
              <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                <Filter className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-charcoal-300" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-charcoal-900 mb-2">No jobs in this filter</h3>
              <p className="text-charcoal-600 text-xs sm:text-sm md:text-base">Try selecting a different filter category</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {filteredJobs.map((job, index) => (
              <Card
                key={job.id}
                className={`bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                  index === 0 && filter === "all" ? 'ring-2 ring-tomato-200' : ''
                }`}
              >
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex items-start gap-2 sm:gap-3 md:gap-5 flex-1 min-w-0">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md md:shadow-lg ${
                          job.status === "COMPLETED" ? "bg-success-100 text-success-600" :
                          job.status === "PENDING" ? "bg-warning-100 text-warning-600" :
                          job.status === "CANCELLED" ? "bg-red-100 text-red-600" :
                          job.status === "READY" ? "bg-info-100 text-info-600" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {getStatusIcon(job.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                            <h3 className="font-bold text-sm sm:text-base md:text-lg text-charcoal-900 truncate">
                              Job #{job.id.slice(0, 8)}
                            </h3>
                            <Badge
                              variant={getStatusColor(job.status) as any}
                              className="px-1.5 sm:px-2 md:px-3 py-0.5 text-[10px] sm:text-xs md:text-sm flex-shrink-0 w-fit"
                            >
                              {formatStatus(job.status)}
                            </Badge>
                          </div>

                          <p className="text-charcoal-600 mb-1.5 sm:mb-2 md:mb-3 text-xs sm:text-sm md:text-base">
                            <span className="font-semibold text-charcoal-900">Customer:</span> +91 {job.user?.phone || "N/A"}
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-4 text-[10px] sm:text-xs md:text-sm text-charcoal-600 mb-1.5 sm:mb-2 md:mb-3">
                            <span className="flex items-center gap-0.5 sm:gap-1 bg-cream-50 px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg">
                              <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                              {job.copies} {job.copies === 1 ? 'copy' : 'copies'}
                            </span>
                            <span className="flex items-center gap-0.5 sm:gap-1 bg-cream-50 px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg">
                              {job.colorMode === "BLACK_WHITE" ? "⚫" : "🔴"} {job.colorMode === "BLACK_WHITE" ? "B&W" : "Color"}
                            </span>
                            <span className="flex items-center gap-0.5 sm:gap-1 bg-cream-50 px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg">
                              📐 {job.paperSize}
                            </span>
                            <span className="text-charcoal-500 hidden sm:block truncate">
                              {new Date(job.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-4">
                            {job.price !== null && (
                              <div className="flex items-center gap-1 sm:gap-2 bg-green-50 text-green-700 px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg">
                                <span className="font-bold text-xs sm:text-sm md:text-base">₹{job.price}</span>
                                <span className="text-[10px] sm:text-xs">Total</span>
                              </div>
                            )}

                            {job.price !== null && (
                              <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-full font-medium ${
                                job.priceAccepted
                                  ? "bg-success-100 text-success-700 border border-success-200"
                                  : "bg-warning-100 text-warning-700 border border-warning-200"
                              }`}>
                                {job.priceAccepted ? "✓ Price Accepted" : "⏳ Waiting for Acceptance"}
                              </span>
                            )}

                            {job.payment?.method && (
                              <Badge
                                variant={
                                  job.payment.method === "ONLINE" ? "info" :
                                  job.payment.method === "OFFLINE" ? "neutral" : "neutral"
                                }
                                className="px-1.5 sm:px-2 md:px-3 py-0.5 text-[10px] sm:text-xs flex-shrink-0"
                              >
                                💳 {job.payment.method === "ONLINE" ? "Online" : "Cash"}
                              </Badge>
                            )}

                            {job.status === "READY" && job.pickupOtp && (
                              <div className="bg-info-50 border border-info-200 text-info-700 px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg flex-shrink-0">
                                <span className="font-mono font-bold text-xs sm:text-sm md:text-base">OTP Ready</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0 w-full sm:w-auto">
                        <Button
                          onClick={() => router.push(`/vendor/jobs/${job.id}`)}
                          className="w-full sm:w-auto bg-gradient-to-r from-tomato-500 to-deepOrange-500 hover:from-tomato-600 hover:to-deepOrange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm"
                        >
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">Details</span>
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {jobs.length > 0 && filteredJobs.length > 0 && (
          <div className="text-center mt-6 sm:mt-8">
            <p className="text-charcoal-600 text-sm sm:text-base">
              Showing {filteredJobs.length} of {jobs.length} jobs
              {filter !== "all" && (
                <Button
                  variant="ghost"
                  onClick={() => setFilter("all")}
                  className="ml-2 text-tomato-600 hover:text-tomato-700 hover:bg-tomato-50 text-sm"
                >
                  View All
                </Button>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}