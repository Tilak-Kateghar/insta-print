"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";

export default function DashboardRouter() {
  const router = useRouter();

  useEffect(() => {
    // First try to check if user is authenticated as a user
    apiFetch("/users/me/dashboard")
      .then(() => router.replace("/user/dashboard"))
      .catch(() =>
        // If not user, try vendor authentication
        apiFetch("/vendors/me/dashboard")
          .then(() => router.replace("/vendor/dashboard"))
          .catch(() => router.replace("/login/user"))
      );
  }, [router]);

  return null;
}