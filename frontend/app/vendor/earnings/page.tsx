"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import {
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  Calendar,
  ArrowRight,
  Sparkles,
  Activity,
  Home
} from "lucide-react";

type Earning = {
  id: string;
  netAmount: number;
  settledAt: string | null;
  job: {
    id: string;
    price: number;
    completedAt: string | null;
  };
};

export default function VendorEarningsPage() {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settling, setSettling] = useState(false);

  async function load() {
    try {
      const res = await apiFetch<{ earnings: Earning[] }>(
        "/print-jobs/vendor/earnings"
      );
      setEarnings(res.earnings);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function settleNow() {
    try {
      setSettling(true);
      await apiFetch("/print-jobs/vendor/settle", { method: "POST" });
      alert("Settlement completed");
      load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSettling(false);
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
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
              <DollarSign className="w-12 h-12 text-green-600 animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <h2 className="text-2xl font-bold text-charcoal-900 mb-2">Loading Earnings</h2>
          <p className="text-lg text-charcoal-600 animate-pulse">Fetching your financial data...</p>
          <div className="mt-6 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream-50 p-6">
        <div className="max-w-md mx-auto">
          <Alert variant="error" title="Error Loading Earnings">
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

  const pending = earnings.filter((e) => !e.settledAt);
  const settled = earnings.filter((e) => e.settledAt);
  const pendingTotal = pending.reduce((sum, e) => sum + e.netAmount, 0);
  const settledTotal = settled.reduce((sum, e) => sum + e.netAmount, 0);
  const totalEarnings = earnings.reduce((sum, e) => sum + e.netAmount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-cream-100 relative">
      <Link href="/" className="absolute top-4 left-4 z-50">
        <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-blue-300">
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Button>
      </Link>
      <div className="bg-white/90 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center shadow-xl shadow-green-200/50 transform hover:scale-105 transition-transform duration-200">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-charcoal-900 mb-1">
                  Earnings Overview
                </h1>
                <p className="text-charcoal-600 flex items-center gap-2 text-lg">
                  <span className="text-charcoal-500 font-medium">Track your business performance</span>
                </p>
                <p className="text-sm text-charcoal-500 mt-1">
                  {earnings.length} total transactions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-charcoal-900 mb-2">
            Your Financial Dashboard
          </h2>
          <p className="text-charcoal-600 max-w-2xl mx-auto">
            Monitor your earnings, track settlements, and grow your printing business with detailed financial insights.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="bg-gradient-to-br from-white to-green-50/30 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-charcoal-600 mb-2 uppercase tracking-wide">Total Earnings</p>
                  <p className="text-4xl font-bold text-charcoal-900 mb-1">₹{totalEarnings.toLocaleString()}</p>
                  <p className="text-xs text-charcoal-500">All time revenue</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center text-green-600 group-hover:from-green-500 group-hover:to-green-600 group-hover:text-white transition-all duration-300 shadow-lg">
                  <DollarSign className="w-7 h-7" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                <TrendingUp className="w-3 h-3" />
                <span>Growing steadily</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-success-50/30 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-charcoal-600 mb-2 uppercase tracking-wide">Settled</p>
                  <p className="text-4xl font-bold text-charcoal-900 mb-1">₹{settledTotal.toLocaleString()}</p>
                  <p className="text-xs text-charcoal-500">Paid to your account</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-success-100 to-success-200 rounded-2xl flex items-center justify-center text-success-600 group-hover:from-success-500 group-hover:to-success-600 group-hover:text-white transition-all duration-300 shadow-lg">
                  <CheckCircle className="w-7 h-7" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-success-600 font-medium">
                <Sparkles className="w-3 h-3" />
                <span>{settled.length} completed payments</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-warning-50/30 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-charcoal-600 mb-2 uppercase tracking-wide">Pending</p>
                  <p className="text-4xl font-bold text-charcoal-900 mb-1">₹{pendingTotal.toLocaleString()}</p>
                  <p className="text-xs text-charcoal-500">Awaiting settlement</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-warning-100 to-warning-200 rounded-2xl flex items-center justify-center text-warning-600 group-hover:from-warning-500 group-hover:to-warning-600 group-hover:text-white transition-all duration-300 shadow-lg">
                  <Clock className="w-7 h-7" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-warning-600 font-medium">
                <Activity className="w-3 h-3" />
                <span>{pending.length} pending settlements</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-info-50/30 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-charcoal-600 mb-2 uppercase tracking-wide">Success Rate</p>
                  <p className="text-4xl font-bold text-charcoal-900 mb-1">
                    {earnings.length > 0 ? Math.round((settled.length / earnings.length) * 100) : 0}%
                  </p>
                  <p className="text-xs text-charcoal-500">Settlement completion</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-info-100 to-info-200 rounded-2xl flex items-center justify-center text-info-600 group-hover:from-info-500 group-hover:to-info-600 group-hover:text-white transition-all duration-300 shadow-lg">
                  <TrendingUp className="w-7 h-7" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-info-600 font-medium">
                <Sparkles className="w-3 h-3" />
                <span>Keep up the great work!</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {pendingTotal > 0 && (
          <Card className="bg-gradient-to-r from-warning-500 to-warning-600 border-0 shadow-lg mb-8 overflow-hidden">
            <CardContent className="p-8 relative">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full"></div>
              <div className="absolute -right-5 -bottom-10 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Ready for Settlement</h3>
                <p className="text-white/80 mb-6 max-w-md mx-auto">
                  You have ₹{pendingTotal.toLocaleString()} pending for settlement. Get paid for your completed work.
                </p>
                <Button
                  onClick={settleNow}
                  disabled={settling}
                  className="bg-white text-warning-600 hover:bg-white/90 shadow-lg px-8 py-3"
                >
                  {settling ? "Processing..." : "Request Settlement"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-charcoal-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500" />
            Earnings History
          </h2>
        </div>

        <Card className="bg-white border-0 shadow-card overflow-hidden">
          {earnings.length === 0 ? (
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-12 h-12 text-charcoal-300" />
              </div>
              <h3 className="text-xl font-semibold text-charcoal-900 mb-2">No earnings yet</h3>
              <p className="text-charcoal-600 mb-6 max-w-sm mx-auto">
                Complete some print jobs to start earning and see your financial history here.
              </p>
              <Button
                onClick={() => window.location.href = "/vendor/jobs"}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
              >
                View Available Jobs
              </Button>
            </CardContent>
          ) : (
            <div className="divide-y divide-gray-100">
              {earnings.slice(0, 10).map((earning, index) => (
                <div
                  key={earning.id}
                  className={`flex items-center justify-between p-4 hover:bg-cream-50 transition-colors ${
                    index === 0 ? 'bg-gradient-to-r from-green-50/50 to-transparent' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      earning.settledAt ? 'bg-success-100 text-success-600' : 'bg-warning-100 text-warning-600'
                    }`}>
                      {earning.settledAt ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal-900">
                        Job #{earning.job.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-charcoal-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {earning.job.completedAt ? new Date(earning.job.completedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : 'Not completed'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={earning.settledAt ? "success" : "warning"}
                      className={earning.settledAt ? 'bg-success-100 text-success-700' : 'bg-warning-100 text-warning-700'}
                    >
                      {earning.settledAt ? "Settled" : "Pending"}
                    </Badge>
                    <div className="text-right">
                      <p className="font-bold text-charcoal-900">
                        ₹{earning.netAmount}
                      </p>
                      <p className="text-xs text-charcoal-500">Net earnings</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {earnings.length > 10 && (
          <div className="text-center mt-6">
            <p className="text-charcoal-600">Showing 10 most recent earnings. View all in detailed reports.</p>
          </div>
        )}
      </div>
    </div>
  );
}