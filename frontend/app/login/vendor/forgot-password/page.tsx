"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/apiFetch";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Home,
  ArrowLeft,
  Phone,
  KeyRound,
  Lock,
  Loader2,
} from "lucide-react";

type Step = "PHONE" | "OTP" | "RESET";

export default function VendorForgotPasswordPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [step, setStep] = useState<Step>("PHONE");
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (phone.trim().length < 10) {
      setError("Enter valid phone number");
      return;
    }

    try {
      setLoading(true);

      const res = await apiFetch<{ otp?: string }>(
        "/vendors/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ phone }),
        }
      );

      if (res?.otp) {
        setDevOtp(res.otp);
      }

      setStep("OTP");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (otp.length !== 6) {
      setError("Enter 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      await apiFetch("/vendors/verify-forgot-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ phone, otp }),
      });

      setStep("RESET");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);

      await apiFetch("/vendors/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ phone, otp, newPassword }),
      });

      router.replace("/login/vendor");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 relative">
      <Link href="/" className="absolute top-4 left-4">
        <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-blue-300">
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Button>
      </Link>

      <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-indigo-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {step === "PHONE" && "Reset Vendor Password"}
            {step === "OTP" && "Verify OTP"}
            {step === "RESET" && "Set New Password"}
          </CardTitle>
          <p className="text-gray-600 text-sm mt-2">
            {step === "PHONE" && "Enter your registered phone number to receive OTP"}
            {step === "OTP" && "Enter the 6-digit OTP sent to your phone"}
            {step === "RESET" && "Create a strong password for your account"}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center justify-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === "PHONE" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              1
            </div>
            <div className={`w-8 h-0.5 ${
              step === "OTP" || step === "RESET" ? "bg-indigo-600" : "bg-gray-200"
            }`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === "OTP" ? "bg-indigo-600 text-white" : step === "RESET" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              2
            </div>
            <div className={`w-8 h-0.5 ${
              step === "RESET" ? "bg-indigo-600" : "bg-gray-200"
            }`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === "RESET" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              3
            </div>
          </div>

          <form
            onSubmit={
              step === "PHONE"
                ? sendOtp
                : step === "OTP"
                ? verifyOtp
                : resetPassword
            }
            className="space-y-4"
          >
            {step === "PHONE" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="Enter your registered phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
            )}

            {step === "OTP" && (
              <div className="space-y-4">
                {process.env.NODE_ENV !== "production" && devOtp && (
                  <Alert variant="info" title="Development Mode">
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold">{devOtp}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(devOtp);
                            setOtp(devOtp);
                          }}
                        >
                          Copy & Fill
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <KeyRound className="w-4 h-4" />
                    OTP Code
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>
              </div>
            )}

            {step === "RESET" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  New Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter new password (min 8 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 py-3 text-lg font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Please wait...
                </>
              ) : step === "PHONE" ? (
                <>
                  <Phone className="w-5 h-5 mr-2" />
                  Send OTP
                </>
              ) : step === "OTP" ? (
                <>
                  <KeyRound className="w-5 h-5 mr-2" />
                  Verify OTP
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Reset Password
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <Link href="/login/vendor">
              <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

