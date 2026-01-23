"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/apiFetch";
import { Printer, ArrowRight, KeyRound, Check, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";

export default function UserLoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDevOtp(null);

    if (phone.trim().length < 10) {
      setError("Enter a valid phone number");
      return;
    }

    try {
      setLoading(true);

      const res = await apiFetch<{ otp?: string }>("/users/send-otp", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });

      if (res?.otp) {
        setDevOtp(res.otp);
      }

      setStep("OTP");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (otp.trim().length !== 6) {
      setError("Enter 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      await apiFetch("/users/verify-otp", {
        method: "POST",
        body: JSON.stringify({ phone, otp }),
      });

      // Try the main dashboard router first, which will redirect to the correct dashboard
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-4 relative">
      {/* Home Button */}
      <Button
        onClick={() => window.location.href = "/"}
        variant="outline"
        size="sm"
        className="absolute top-4 left-4 flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-tomato-300"
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Home</span>
      </Button>

      <div className="w-full max-w-sm sm:max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gray-900 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Printer className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">InstaPrint</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Printing Made Simple by Skipping the Queue's</p>
        </div>

        <Card>
          <CardHeader className="text-center pb-2 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">
              {step === "PHONE" ? "Welcome back" : "Enter OTP"}
            </CardTitle>
            <CardDescription className="text-sm">
              {step === "PHONE" 
                ? "Enter your phone number to continue" 
                : `We sent a code to ${phone}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form 
              onSubmit={step === "PHONE" ? sendOtp : verifyOtp}
              className="space-y-4"
            >
              {step === "PHONE" && (
                <Input
                  type="tel"
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                  error={error || undefined}
                  className="text-sm sm:text-base"
                />
              )}

              {step === "OTP" && (
                <>
                  <Input
                    type="text"
                    label="Verification Code"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    error={error || undefined}
                    maxLength={6}
                    className="text-sm sm:text-base"
                  />

                  {process.env.NODE_ENV !== "production" && devOtp && (
                    <Alert variant="info" title="Development Mode">
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
                          icon={<Check className="w-4 h-4" />}
                        >
                          Copy & Fill
                        </Button>
                      </div>
                    </Alert>
                  )}
                </>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
                icon={step === "PHONE" ? <ArrowRight className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
              >
                {loading
                  ? "Please wait..."
                  : step === "PHONE"
                  ? "Send OTP"
                  : "Verify OTP"}
              </Button>
            </form>

            {step === "OTP" && (
              <button
                type="button"
                onClick={() => {
                  setStep("PHONE");
                  setOtp("");
                  setError(null);
                }}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-4"
              >
                Change phone number
              </button>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6 px-2">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}