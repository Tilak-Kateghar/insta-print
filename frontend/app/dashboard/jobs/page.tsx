"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";

type Job = {
  id: string;
  status: string;
  price: number | null;
  createdAt: string;
  vendor?: {
    shopName: string;
  };
};

export default function UserJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ jobs: Job[] }>("/print-jobs/my")
      .then((res) => setJobs(res.jobs))
      .catch(() => router.replace("/login/user"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <p className="p-4">Loading jobs...</p>;

  if (jobs.length === 0) {
    return <p className="p-4">No jobs yet</p>;
  }

  return (
    <div className="p-6 space-y-3">
      <h1 className="text-xl font-semibold">My Print Jobs</h1>

      {jobs.map((job) => (
        <div
          key={job.id}
          className="border p-4 rounded cursor-pointer"
          onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
        >
          <div className="flex justify-between">
            <span>{job.vendor?.shopName ?? "Pending vendor"}</span>
            <span>{job.status}</span>
          </div>

          <div className="text-sm">
            {job.price ? `₹${job.price}` : "Price pending"}
          </div>
        </div>
      ))}
    </div>
  );
}