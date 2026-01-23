"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Printer,
  Filter,
  FileText,
  Clock,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge, formatStatus } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";

type Job = {
  id: string;
  status: string;
  createdAt: string;
  price: number | null;
  priceAccepted: boolean;
  pickupOtp?: { otp: string } | null;
  payment?: {
    status: "INITIATED" | "PAID" | "REFUND_PENDING" | "REFUNDED" | "CANCELLED";
    method: "ONLINE" | "OFFLINE";
  } | null;
  vendor?: {
    shopName: string;
    ownerName: string;
  };
};

type JobListResponse = {
  jobs: Job[];
};

export default function UserJobListClient() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    apiFetch<JobListResponse>("/print-jobs/my")
      .then((res) => setJobs(res.jobs))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <PageLoader text="Loading your jobs..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert variant="error" title="Error loading jobs">
          {error}
        </Alert>
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

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-tomato-50 via-white to-deepOrange-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/50 shadow-lg">
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal-900 mb-1 sm:mb-2 truncate">
                My Print Jobs
              </h1>
              <p className="text-charcoal-600 text-sm sm:text-base md:text-lg max-w-md">
                Track and manage your print orders with easy access to all your documents.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:gap-4 w-full sm:w-auto">
              <Button
                onClick={() => router.push("/user/jobs/new")}
                className="bg-gradient-to-r from-tomato-500 to-deepOrange-500 hover:from-tomato-600 hover:to-deepOrange-600 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg font-semibold w-full sm:w-auto"
                icon={<Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
              >
                <span className="hidden sm:inline">Create New Job</span>
                <span className="sm:hidden">New Job</span>
              </Button>
              <p className="text-xs sm:text-sm text-charcoal-500 text-center">
                Takes less than 2 minutes
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card
          className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
            filter === "all"
              ? "bg-gradient-to-br from-tomato-50 to-tomato-100 border-tomato-200 shadow-xl"
              : "bg-white hover:border-tomato-200 hover:shadow-lg"
          }`}
          onClick={() => setFilter("all")}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-tomato-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-tomato-600" />
            </div>
            <p className="text-3xl font-bold text-charcoal-900 mb-1">{jobs.length}</p>
            <p className="text-sm font-medium text-charcoal-600">All Jobs</p>
            <p className="text-xs text-charcoal-500 mt-1">Total orders</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
            filter === "active"
              ? "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-xl"
              : "bg-white hover:border-blue-200 hover:shadow-lg"
          }`}
          onClick={() => setFilter("active")}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-charcoal-900 mb-1">{activeCount}</p>
            <p className="text-sm font-medium text-charcoal-600">Active</p>
            <p className="text-xs text-charcoal-500 mt-1">In progress</p>
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
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-success-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-success-600" />
            </div>
            <p className="text-3xl font-bold text-charcoal-900 mb-1">{completedCount}</p>
            <p className="text-sm font-medium text-charcoal-600">Completed</p>
            <p className="text-xs text-charcoal-500 mt-1">Delivered</p>
          </CardContent>
        </Card>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Printer className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No print jobs yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Create your first print job to see it here. It is quick and easy!
            </p>
            <Button onClick={() => router.push("/user/jobs/new")} icon={<Plus className="w-4 h-4" />}>
              Create Your First Job
            </Button>
          </CardContent>
        </Card>
      ) : filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs in this filter</h3>
            <p className="text-gray-500">Try selecting a different filter</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start gap-3 sm:gap-4 md:gap-5 flex-1 min-w-0">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md md:shadow-lg ${
                      job.status === "COMPLETED" ? "bg-success-100 text-success-600" :
                      job.status === "PENDING" ? "bg-warning-100 text-warning-600" :
                      job.status === "CANCELLED" ? "bg-red-100 text-red-600" :
                      job.status === "READY" ? "bg-info-100 text-info-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {job.status === "COMPLETED" ? <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" /> :
                       job.status === "PENDING" ? <Clock className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" /> :
                       job.status === "READY" ? <Printer className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" /> :
                       <FileText className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="font-bold text-base sm:text-lg text-charcoal-900 truncate">
                          Job #{job.id.slice(0, 8)}
                        </h3>
                        <Badge variant={
                          job.status === "COMPLETED" ? "success" :
                          job.status === "PENDING" ? "warning" :
                          job.status === "CANCELLED" ? "danger" :
                          job.status === "READY" ? "info" : "neutral"
                        } className="px-2 py-0.5 sm:px-3 sm:py-1 text-xs w-fit">
                          {formatStatus(job.status)}
                        </Badge>
                      </div>

                      <p className="text-charcoal-600 mb-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                        {job.vendor?.shopName && (
                          <>
                            <span className="font-semibold text-charcoal-900 truncate">{job.vendor.shopName}</span>
                            <span className="text-charcoal-400 hidden sm:inline">•</span>
                          </>
                        )}
                        <span className="text-xs sm:text-sm">
                          {new Date(job.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </p>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
                        {job.price !== null && (
                          <div className="flex items-center gap-1.5 sm:gap-2 bg-tomato-50 text-tomato-700 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg">
                            <span className="font-bold text-sm sm:text-base md:text-lg">₹{job.price}</span>
                            <span className="text-xs sm:text-sm">Total</span>
                          </div>
                        )}

                        {job.price !== null && (
                          <span className={`text-[10px] sm:text-xs px-2 py-1 sm:px-3 sm:py-1.5 rounded-full font-medium ${
                            job.priceAccepted
                              ? "bg-success-100 text-success-700 border border-success-200"
                              : "bg-warning-100 text-warning-700 border border-warning-200"
                          }`}>
                            {job.priceAccepted ? "✓ Price Accepted" : "⏳ Pending Acceptance"}
                          </span>
                        )}

                        {job.payment?.method && (
                          <Badge variant={
                            job.payment.method === "ONLINE" ? "info" :
                            job.payment.method === "OFFLINE" ? "neutral" : "neutral"
                          } className="px-2 py-0.5 sm:px-3 sm:py-1.5 text-xs">
                            💳 {job.payment.method === "ONLINE" ? "Online" : "Cash"}
                          </Badge>
                        )}

                        {job.status === "READY" && job.pickupOtp && (
                          <div className="bg-success-50 border border-success-200 text-success-700 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg">
                            <span className="font-mono font-bold text-sm sm:text-base md:text-lg">{job.pickupOtp.otp}</span>
                            <span className="text-[10px] sm:text-xs ml-1">(Pickup Code)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 w-full sm:w-auto">
                    <Link href={`/user/jobs/${job.id}`}>
                      <Button className="bg-gradient-to-r from-tomato-500 to-deepOrange-500 hover:from-tomato-600 hover:to-deepOrange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-2.5 w-full sm:w-auto text-sm sm:text-base">
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">Details</span>
                        <Printer className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}