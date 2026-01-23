"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/apiFetch";
import { Button } from "@/components/ui/Button";
import { Home } from "lucide-react";

export default function VendorSignupPage() {
  const router = useRouter();

  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setError(null);

    const cleanPhone = phone.replace(/\D/g, "");

    if (
      shopName.trim().length < 2 ||
      ownerName.trim().length < 2 ||
      cleanPhone.length !== 10 ||
      password.length < 8
    ) {
      setError("Please fill all fields correctly");
      return;
    }

    try {
      setLoading(true);

      await apiFetch("/vendors/signup", {
        method: "POST",
        body: JSON.stringify({
          shopName: shopName.trim(),
          ownerName: ownerName.trim(),
          phone: cleanPhone,
          password,
        }),
      });

      router.replace("/login/vendor");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <Button
        onClick={() => window.location.href = "/"}
        variant="outline"
        size="sm"
        className="absolute top-4 left-4 flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-blue-300"
      >
        <Home className="h-4 w-4" />
        <span>Home</span>
      </Button>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4"
      >
        <h1 className="text-xl font-semibold">Vendor Signup</h1>

        <input
          type="text"
          placeholder="Shop name"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Owner name"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Password (min 8 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white p-2 rounded"
        >
          {loading ? "Creating account..." : "Create Vendor Account"}
        </button>

        <p className="text-sm text-center">
          Already a vendor?{" "}
          <button
            type="button"
            className="underline"
            onClick={() => router.push("/login/vendor")}
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
}