"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";
import { logoutUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import {
  Printer,
  FileText,
  CheckCircle,
  Clock,
  DollarSign,
  Plus,
  TrendingUp,
  Activity,
  LogOut,
  User,
  Calendar,
  ChevronRight,
  Sparkles,
  ArrowRight
} from "lucide-react";

type DashboardResponse = {
  user: {
    id: string;
    phone: string;
    name: string | null;
    createdAt: string;
  };
  summary: {
    totalJobs: number;
    completedJobs: number;
    cancelledJobs: number;
    pendingJobs: number;
    totalSpent: number;
  };
  jobs: Array<{
    id: string;
    status: string;
    price: number | null;
    createdAt: string;
    vendor: {
      shopName: string;
    };
  }>;
};

export default function UserDashboardClient() {
  const router = useRouter();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setError(null);
        const response = await apiFetch<DashboardResponse>("/users/me/dashboard");
        setData(response);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [router]);

  async function handleLogout() {
    await logoutUser();
    window.location.href = "/login/user";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-cream-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-tomato-100 to-deepOrange-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Printer className="w-12 h-12 text-tomato-500 animate-pulse" />
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
      <div className="min-h-screen bg-cream-50 p-6">
        <div className="max-w-md mx-auto">
          <Alert variant="error" title="Error Loading Dashboard">
            <p className="text-charcoal-700">{error}</p>
            <div className="flex gap-3 mt-4">
              <Button onClick={() => window.location.reload()} variant="outline" className="border-gray-200">
                Try Again
              </Button>
              <Button onClick={handleLogout} variant="danger" className="bg-red-500 hover:bg-red-600">
                Logout
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return "success";
      case "pending": return "warning";
      case "ready": return "info";
      case "cancelled": return "danger";
      default: return "neutral";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return <CheckCircle className="w-5 h-5" />;
      case "pending": return <Clock className="w-5 h-5" />;
      case "ready": return <Printer className="w-5 h-5" />;
      case "cancelled": return <Activity className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const statusColors = {
    completed: "bg-success-100 text-success-700",
    pending: "bg-warning-100 text-warning-700",
    ready: "bg-info-100 text-info-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-cream-100">
      <div className="bg-white/90 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex items-center gap-3 sm:gap-5 flex-1">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-tomato-500 to-deepOrange-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl shadow-tomato-200/50 transform hover:scale-105 transition-transform duration-200">
                    <User className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-charcoal-900 mb-1 truncate">
                    Welcome Back
                  </h1>
                  <p className="text-charcoal-600 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                    <span className="text-charcoal-500 font-medium">+91</span>
                    <span className="font-mono break-all">{data.user.phone}</span>
                  </p>
                  <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5 sm:mt-1">
                    Member since {new Date(data.user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <Button
                  onClick={() => router.push("/user/jobs/new")}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-tomato-500 to-deepOrange-500 hover:from-tomato-600 hover:to-deepOrange-600 text-white shadow-xl shadow-tomato-200/50 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold transform hover:scale-105 transition-all duration-200"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                  <span className="truncate">New Job</span>
                </Button>
                <Button
                  onClick={async () => {
                    await logoutUser();
                    window.location.href = "/login/user";
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 sm:mb-8 text-center px-2">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-charcoal-900 mb-2">
            Your Print Journey at a Glance
          </h2>
          <p className="text-charcoal-600 max-w-2xl mx-auto text-sm sm:text-base">
            Track your printing activities, manage orders, and discover new ways to get your documents printed professionally.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-10">
          <Card className="bg-gradient-to-br from-white to-tomato-50/30 border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-start justify-between mb-2 sm:mb-3 md:mb-4 gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-charcoal-600 mb-1 uppercase tracking-wide truncate">Total Jobs</p>
                  <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-charcoal-900 mb-0.5">{data.summary.totalJobs}</p>
                  <p className="text-[10px] sm:text-xs text-charcoal-500 truncate">All time orders</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-tomato-100 to-tomato-200 rounded-xl md:rounded-2xl flex items-center justify-center text-tomato-600 group-hover:from-tomato-500 group-hover:to-tomato-600 group-hover:text-white transition-all duration-300 shadow-md md:shadow-lg flex-shrink-0">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-tomato-600 font-medium">
                <TrendingUp className="w-3 h-3" />
                <span className="truncate">Keep printing!</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-success-50/30 border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-start justify-between mb-2 sm:mb-3 md:mb-4 gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-charcoal-600 mb-1 uppercase tracking-wide truncate">Completed</p>
                  <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-charcoal-900 mb-0.5">{data.summary.completedJobs}</p>
                  <p className="text-[10px] sm:text-xs text-charcoal-500 truncate">Successfully delivered</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-success-100 to-success-200 rounded-xl md:rounded-2xl flex items-center justify-center text-success-600 group-hover:from-success-500 group-hover:to-success-600 group-hover:text-white transition-all duration-300 shadow-md md:shadow-lg flex-shrink-0">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-success-600 font-medium">
                <TrendingUp className="w-3 h-3" />
                <span className="truncate">
                  {data.summary.totalJobs > 0
                    ? `${Math.round((data.summary.completedJobs / data.summary.totalJobs) * 100)}% success rate`
                    : 'Start your first job!'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-warning-50/30 border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-start justify-between mb-2 sm:mb-3 md:mb-4 gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-charcoal-600 mb-1 uppercase tracking-wide truncate">In Progress</p>
                  <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-charcoal-900 mb-0.5">{data.summary.pendingJobs}</p>
                  <p className="text-[10px] sm:text-xs text-charcoal-500 truncate">Being processed</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-warning-100 to-warning-200 rounded-xl md:rounded-2xl flex items-center justify-center text-warning-600 group-hover:from-warning-500 group-hover:to-warning-600 group-hover:text-white transition-all duration-300 shadow-md md:shadow-lg flex-shrink-0">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-warning-600 font-medium">
                <Activity className="w-3 h-3" />
                <span className="truncate">Active orders</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-info-50/30 border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-start justify-between mb-2 sm:mb-3 md:mb-4 gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-charcoal-600 mb-1 uppercase tracking-wide truncate">Total Spent</p>
                  <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-charcoal-900 mb-0.5">₹{data.summary.totalSpent.toLocaleString()}</p>
                  <p className="text-[10px] sm:text-xs text-charcoal-500 truncate">Lifetime investment</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-info-100 to-info-200 rounded-xl md:rounded-2xl flex items-center justify-center text-info-600 group-hover:from-info-500 group-hover:to-info-600 group-hover:text-white transition-all duration-300 shadow-md md:shadow-lg flex-shrink-0">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-info-600 font-medium">
                <Sparkles className="w-3 h-3" />
                <span className="truncate">Avg: ₹{data.summary.totalJobs > 0 ? Math.round(data.summary.totalSpent / data.summary.totalJobs) : 0}/job</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {data.jobs.length === 0 && (
          <Card className="bg-gradient-to-r from-tomato-500 to-deepOrange-500 border-0 shadow-lg mb-8 overflow-hidden">
            <CardContent className="p-8 relative">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full"></div>
              <div className="absolute -right-5 -bottom-10 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Printer className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Ready to print?</h3>
                <p className="text-white/80 mb-6 max-w-md mx-auto">
                  Upload your documents and get professional prints delivered to your doorstep or ready for pickup.
                </p>
                <Button
                  onClick={() => router.push("/user/jobs/new")}
                  className="bg-white text-tomato-600 hover:bg-white/90 shadow-lg px-8 py-3"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Job
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-charcoal-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-tomato-500" />
            Recent Jobs
          </h2>
          {data.jobs.length > 0 && (
            <Button
              variant="ghost"
              onClick={() => router.push("/user/jobs")}
              className="text-tomato-600 hover:text-tomato-700 hover:bg-tomato-50 w-full sm:w-auto"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>

        <Card className="bg-white border-0 shadow-card overflow-hidden">
          {data.jobs.length === 0 ? (
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Printer className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-charcoal-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-charcoal-900 mb-2">No print jobs yet</h3>
              <p className="text-charcoal-600 mb-6 max-w-sm mx-auto text-sm sm:text-base">
                Ready to start printing? Create your first job and experience professional printing services.
              </p>
              <Button
                onClick={() => router.push("/user/jobs/new")}
                className="bg-gradient-to-r from-tomato-500 to-deepOrange-500 hover:from-tomato-600 hover:to-deepOrange-600 text-white shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Job
              </Button>
            </CardContent>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.jobs.slice(0, 5).map((job, index) => (
                <div
                  key={job.id}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 hover:bg-cream-50 transition-colors cursor-pointer group gap-3 ${
                    index === 0 ? 'bg-gradient-to-r from-tomato-50/50 to-transparent' : ''
                  }`}
                  onClick={() => router.push(`/user/jobs/${job.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      job.status === 'COMPLETED' ? 'bg-success-100 text-success-600' :
                      job.status === 'PENDING' ? 'bg-warning-100 text-warning-600' :
                      job.status === 'READY' ? 'bg-info-100 text-info-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {getStatusIcon(job.status)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-charcoal-900 group-hover:text-tomato-600 transition-colors truncate">
                        {job.vendor.shopName}
                      </p>
                      <p className="text-xs sm:text-sm text-charcoal-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{new Date(job.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                    <Badge
                      variant={getStatusColor(job.status) as any}
                      className={`${statusColors[job.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700'} flex-shrink-0`}
                    >
                      {job.status}
                    </Badge>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-charcoal-900">
                        {job.price ? `₹${job.price}` : 'TBD'}
                      </p>
                      <p className="text-[10px] sm:text-xs text-charcoal-500 hidden sm:block">Price</p>
                    </div>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-charcoal-300 group-hover:text-tomato-500 transition-colors flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="mt-8 sm:mt-10 md:mt-12">
          <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 mb-2 text-center">Quick Actions</h2>
          <p className="text-charcoal-600 text-center mb-6 sm:mb-8 text-sm sm:text-base">Everything you need is just one click away</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="bg-gradient-to-br from-white to-tomato-50/30 border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1">
              <CardContent className="p-5 sm:p-6 md:p-8">
                <div className="flex items-center gap-3 sm:gap-5 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-tomato-100 to-tomato-200 rounded-xl sm:rounded-2xl flex items-center justify-center text-tomato-600 group-hover:from-tomato-500 group-hover:to-tomato-600 group-hover:text-white transition-all duration-300 shadow-md md:shadow-lg flex-shrink-0">
                    <Plus className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg sm:text-xl text-charcoal-900 mb-1 truncate">New Print Job</h3>
                    <p className="text-charcoal-600 text-sm truncate">Upload and print documents</p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push("/user/jobs/new")}
                  className="w-full bg-gradient-to-r from-tomato-500 to-deepOrange-500 hover:from-tomato-600 hover:to-deepOrange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 py-2.5 sm:py-3 text-sm sm:text-base font-semibold"
                >
                  Create Job
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-success-50/30 border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1">
              <CardContent className="p-5 sm:p-6 md:p-8">
                <div className="flex items-center gap-3 sm:gap-5 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-success-100 to-success-200 rounded-xl sm:rounded-2xl flex items-center justify-center text-success-600 group-hover:from-success-500 group-hover:to-success-600 group-hover:text-white transition-all duration-300 shadow-md md:shadow-lg flex-shrink-0">
                    <Activity className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg sm:text-xl text-charcoal-900 mb-1 truncate">Track Orders</h3>
                    <p className="text-charcoal-600 text-sm truncate">Monitor your print progress</p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push("/user/jobs")}
                  className="w-full bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 py-2.5 sm:py-3 text-sm sm:text-base font-semibold"
                >
                  View Jobs
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-info-50/30 border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
              <CardContent className="p-5 sm:p-6 md:p-8">
                <div className="flex items-center gap-3 sm:gap-5 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-info-100 to-info-200 rounded-xl sm:rounded-2xl flex items-center justify-center text-info-600 group-hover:from-info-500 group-hover:to-info-600 group-hover:text-white transition-all duration-300 shadow-md md:shadow-lg flex-shrink-0">
                    <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg sm:text-xl text-charcoal-900 mb-1 truncate">Your Stats</h3>
                    <p className="text-charcoal-600 text-sm truncate">View detailed analytics</p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    const statsSection = document.querySelector('.grid.grid-cols-2.lg\\:grid-cols-4');
                    if (statsSection) {
                      statsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="w-full bg-gradient-to-r from-info-500 to-info-600 hover:from-info-600 hover:to-info-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 py-2.5 sm:py-3 text-sm sm:text-base font-semibold"
                >
                  View Stats
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}