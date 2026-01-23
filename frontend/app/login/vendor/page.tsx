"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";
import { verifyVendorAuth } from "@/lib/auth";
import {
  Store,
  Phone,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";

export default function VendorLoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (phone.trim().length < 10 || password.length < 8) {
      setError("Please enter valid phone number and password");
      return;
    }

    try {
      setLoading(true);

      // Login request
      const res = await apiFetch<{ success?: boolean; role?: string; message?: string }>(
        "/vendors/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ phone, password }),
        }
      );

      // CRITICAL: Verify auth state by calling /vendor/me
      // This confirms the cookie was properly set and auth is working
      const isAuthenticated = await verifyVendorAuth();

      if (isAuthenticated) {
        // Auth confirmed - redirect to vendor dashboard
        router.replace("/vendor/dashboard");
      } else {
        // Auth verification failed - cookie may not be set
        setError("Authentication failed. Please try again or contact support.");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 relative">
      <Button
        onClick={() => window.location.href = "/"}
        variant="outline"
        size="sm"
        className="absolute top-4 left-4 flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-blue-300"
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Home</span>
      </Button>

      <div className="w-full max-w-sm sm:max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
            <Store className="h-6 w-6 sm:h-7 sm:h-7 md:h-8 md:w-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Welcome Back</h1>
          <p className="text-gray-600 text-sm sm:text-base">Sign in to your print shop dashboard</p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 p-5 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                Phone Number
              </label>
              <div className="relative">
                <Input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-4 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="h-4 w-4 text-gray-500" />
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-4 pr-12 py-2.5 sm:py-3 text-sm sm:text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="error" className="border-red-200 bg-red-50">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-800 text-sm">{error}</span>
                </div>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={loading || !phone.trim() || !password}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 sm:py-3 text-sm sm:text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push("/login/vendor/forgot-password")}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                disabled={loading}
              >
                Forgot your password?
              </button>
            </div>

            <div className="relative hidden sm:block">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New to our platform?</span>
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push("/login/vendor/signup")}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium hover:underline"
                disabled={loading}
              >
                Create your print shop account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

