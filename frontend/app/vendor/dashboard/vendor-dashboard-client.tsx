"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { logoutVendor } from "@/lib/auth";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import {
  FileText,
  Clock,
  CheckCircle,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Store,
  LogOut,
  Activity,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Home
} from "lucide-react";

type Job = {
  id: string;
  status: "PENDING" | "READY" | "COMPLETED" | "CANCELLED";
};

type Vendor = {
  id: string;
  shopName: string;
  ownerName: string | null;
  phone: string;
};

type EarningsSummary = {
  totalNetEarned: number;
  pendingSettlement: number;
};

export default function VendorDashboardClient() {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setError(null);
        console.log("Fetching vendor dashboard...");
        
        const [jobsRes, earningsRes] = await Promise.all([
          apiFetch<{ vendor: Vendor; jobs: Job[] }>("/print-jobs/vendor/my"),
          apiFetch<EarningsSummary>("/print-jobs/vendor/earnings/summary"),
        ]);
        
        console.log("Vendor:", jobsRes.vendor);
        console.log("Vendor jobs:", jobsRes.jobs);
        console.log("Vendor earnings:", earningsRes);
        
        setVendor(jobsRes.vendor);
        setJobs(jobsRes.jobs || []);
        setEarnings(earningsRes);
      } catch (err: any) {
        console.error("Vendor dashboard error:", err);
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-cream-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-tomato-100 to-deepOrange-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Store className="w-12 h-12 text-tomato-500 animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-tomato-500 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-deepOrange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <h2 className="text-2xl font-bold text-charcoal-900 mb-2">Welcome back! 👋</h2>
          <p className="text-lg text-charcoal-600 animate-pulse">Loading your dashboard...</p>
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
      <div className="p-6 space-y-4">
        <Alert variant="error" title="Error Loading Dashboard">
          <p>{error}</p>
          <div className="flex gap-3 mt-4">
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
            <Button 
              onClick={async () => {
                await logoutVendor();
                window.location.href = "/login/vendor";
              }} 
              variant="danger"
            >
              Logout
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  const pending = jobs.filter(j => j.status === "PENDING").length;
  const ready = jobs.filter(j => j.status === "READY").length;
  const completed = jobs.filter(j => j.status === "COMPLETED").length;

  const hasActionRequired = pending > 0 || ready > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-cream-100 relative">
      <Link href="/" className="absolute top-4 left-4 z-50">
        <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-blue-300">
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Button>
      </Link>
      <div className="bg-white/90 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex items-center gap-3 sm:gap-5 flex-1">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-tomato-500 to-deepOrange-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl shadow-tomato-200/50 transform hover:scale-105 transition-transform duration-200">
                    <Store className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-charcoal-900 mb-1 truncate">
                    Welcome Back{vendor?.ownerName ? `, ${vendor.ownerName}` : ""}
                  </h1>
                  {vendor?.shopName && (
                    <p className="text-tomato-600 font-semibold text-sm sm:text-lg mb-0.5 truncate">
                      {vendor.shopName}
                    </p>
                  )}
                  <p className="text-charcoal-600 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                    <span className="font-mono break-all">+91 {vendor?.phone}</span>
                  </p>
                  <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5 sm:mt-1 hidden sm:block">
                    Manage your print jobs and earnings
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <Button
                  onClick={async () => {
                    await logoutVendor();
                    window.location.href = "/login/vendor";
                  }}
                  variant="outline"
                  className="flex-1 sm:flex-none border-gray-200 text-charcoal-600 hover:border-tomato-300 hover:text-tomato-600 hover:bg-tomato-50 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 text-center px-2">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-charcoal-900 mb-2">
            Your Business at a Glance
          </h2>
          <p className="text-charcoal-600 max-w-2xl mx-auto text-sm sm:text-base">
            Track your print orders, manage earnings, and grow your printing business professionally.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-10">
          <Card className="bg-gradient-to-br from-white to-yellow-50/30 border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-start justify-between mb-2 sm:mb-3 md:mb-4 gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-charcoal-600 mb-1 uppercase tracking-wide truncate">Pending Jobs</p>
                  <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-charcoal-900 mb-0.5">{pending}</p>
                  <p className="text-[10px] sm:text-xs text-charcoal-500 truncate">Awaiting pricing</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl md:rounded-2xl flex items-center justify-center text-yellow-600 group-hover:from-yellow-500 group-hover:to-yellow-600 group-hover:text-white transition-all duration-300 shadow-md md:shadow-lg flex-shrink-0">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-yellow-600 font-medium">
                <Activity className="w-3 h-3" />
                <span className="truncate">Needs attention</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-success-50/30 border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-start justify-between mb-2 sm:mb-3 md:mb-4 gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-charcoal-600 mb-1 uppercase tracking-wide truncate">Ready for Pickup</p>
                  <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-charcoal-900 mb-0.5">{ready}</p>
                  <p className="text-[10px] sm:text-xs text-charcoal-500 truncate">Ready to collect</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-success-100 to-success-200 rounded-xl md:rounded-2xl flex items-center justify-center text-success-600 group-hover:from-success-500 group-hover:to-success-600 group-hover:text-white transition-all duration-300 shadow-md md:shadow-lg flex-shrink-0">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-success-600 font-medium">
                <TrendingUp className="w-3 h-3" />
                <span className="truncate">Ready for delivery</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-info-50/30 border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-start justify-between mb-2 sm:mb-3 md:mb-4 gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-charcoal-600 mb-1 uppercase tracking-wide truncate">Completed Jobs</p>
                  <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-charcoal-900 mb-0.5">{completed}</p>
                  <p className="text-[10px] sm:text-xs text-charcoal-500 truncate">Successfully delivered</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-info-100 to-info-200 rounded-xl md:rounded-2xl flex items-center justify-center text-info-600 group-hover:from-info-500 group-hover:to-info-600 group-hover:text-white transition-all duration-300 shadow-md md:shadow-lg flex-shrink-0">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-info-600 font-medium">
                <Sparkles className="w-3 h-3" />
                <span className="truncate">
                  {jobs.length > 0
                    ? `${Math.round((completed / jobs.length) * 100)}% completion rate`
                    : 'Start your first job!'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-green-50/30 border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-start justify-between mb-2 sm:mb-3 md:mb-4 gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-charcoal-600 mb-1 uppercase tracking-wide truncate">Net Earnings</p>
                  <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-charcoal-900 mb-0.5">₹{earnings?.totalNetEarned ?? 0}</p>
                  <p className="text-[10px] sm:text-xs text-charcoal-500 truncate">Total earnings</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl md:rounded-2xl flex items-center justify-center text-green-600 group-hover:from-green-500 group-hover:to-green-600 group-hover:text-white transition-all duration-300 shadow-md md:shadow-lg flex-shrink-0">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-green-600 font-medium">
                <TrendingUp className="w-3 h-3" />
                <span className="truncate">₹{earnings?.pendingSettlement ?? 0} pending</span>
              </div>
            </CardContent>
          </Card>
        </div>

      {hasActionRequired && (
        <Card className="bg-gradient-to-r from-warning-500 to-warning-600 border-0 shadow-lg mb-6 sm:mb-8 md:mb-10 overflow-hidden">
          <CardContent className="p-6 sm:p-8 relative">
            <div className="absolute -right-10 -top-10 w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full"></div>
            <div className="absolute -right-5 -bottom-10 w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-full"></div>
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">Action Required</h3>
                  <p className="text-white/80 text-sm sm:text-base">You have pending tasks that need your attention</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {pending > 0 && (
                  <Link href="/vendor/jobs">
                    <Button 
                      variant="secondary" 
                      className="bg-white text-warning-600 hover:bg-white/90 shadow-lg px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold"
                    >
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Set Prices ({pending})
                    </Button>
                  </Link>
                )}
                {ready > 0 && (
                  <Link href="/vendor/jobs">
                    <Button 
                      variant="secondary" 
                      className="bg-white text-warning-600 hover:bg-white/90 shadow-lg px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold"
                    >
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Verify Pickups ({ready})
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!hasActionRequired && jobs.length > 0 && (
        <Card className="bg-gradient-to-r from-success-500 to-success-600 border-0 shadow-lg mb-6 sm:mb-8 md:mb-10 overflow-hidden">
          <CardContent className="p-6 sm:p-8 relative">
            <div className="absolute -right-10 -top-10 w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full"></div>
            <div className="absolute -right-5 -bottom-10 w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-full"></div>
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">All caught up! 🎉</h3>
              <p className="text-white/80 mb-4 text-sm sm:text-base">No pending actions required. Great work!</p>
            </div>
          </CardContent>
        </Card>
      )}

        <div className="mt-8 sm:mt-10 md:mt-12">
          <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 mb-2 text-center">Quick Actions</h2>
          <p className="text-charcoal-600 text-center mb-6 sm:mb-8 text-sm sm:text-base">Everything you need is just one click away</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Card className="bg-gradient-to-br from-white to-tomato-50/30 border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1">
              <CardContent className="p-5 sm:p-6 md:p-8">
                <div className="flex items-center gap-3 sm:gap-5 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-tomato-100 to-tomato-200 rounded-xl sm:rounded-2xl flex items-center justify-center text-tomato-600 group-hover:from-tomato-500 group-hover:to-tomato-600 group-hover:text-white transition-all duration-300 shadow-md md:shadow-lg flex-shrink-0">
                    <FileText className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg sm:text-xl text-charcoal-900 mb-1 truncate">Manage Jobs</h3>
                    <p className="text-charcoal-600 text-sm truncate">View and update all print orders</p>
                  </div>
                </div>
                <Link href="/vendor/jobs">
                  <Button className="w-full bg-gradient-to-r from-tomato-500 to-deepOrange-500 hover:from-tomato-600 hover:to-deepOrange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 py-2.5 sm:py-3 text-sm sm:text-base font-semibold">
                    View All Jobs
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-success-50/30 border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1">
              <CardContent className="p-5 sm:p-6 md:p-8">
                <div className="flex items-center gap-3 sm:gap-5 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-success-100 to-success-200 rounded-xl sm:rounded-2xl flex items-center justify-center text-success-600 group-hover:from-success-500 group-hover:to-success-600 group-hover:text-white transition-all duration-300 shadow-md md:shadow-lg flex-shrink-0">
                    <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg sm:text-xl text-charcoal-900 mb-1 truncate">View Earnings</h3>
                    <p className="text-charcoal-600 text-sm truncate">Track your business performance</p>
                  </div>
                </div>
                <Link href="/vendor/earnings">
                  <Button className="w-full bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 py-2.5 sm:py-3 text-sm sm:text-base font-semibold">
                    View Earnings
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}