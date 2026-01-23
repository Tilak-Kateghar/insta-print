"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { useRouter } from "next/navigation";

type PrintJob = {
  id: string;
  createdAt: string;
  status: string;
  copies: number;
  colorMode: string;
  paperSize: string;
  price: number | null;
};

export default function VendorJobsClient() {
  const router = useRouter();

  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await apiFetch<{ jobs: PrintJob[] }>(
          "/print-jobs/vendor/my"
        );
        setJobs(res.jobs);
      } catch (err: any) {
        setError(err.message || "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, []);

  if (loading) {
    return <div className="p-6">Loading jobs...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  if (jobs.length === 0) {
    return <div className="p-6">No jobs yet.</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Your Print Jobs</h1>

      <ul className="space-y-3">
        {jobs.map((job) => (
          <li
            key={job.id}
            className="border p-4 rounded cursor-pointer hover:bg-gray-50"
            onClick={() => router.push(`/vendor/jobs/${job.id}`)}
          >
            <div className="flex justify-between">
              <span className="font-medium">
                Job #{job.id.slice(0, 8)}
              </span>
              <span className="text-sm">{job.status}</span>
            </div>

            <div className="text-sm text-gray-600">
              {job.copies} copies · {job.colorMode} · {job.paperSize}
            </div>

            <div className="text-sm">
              Price: {job.price ?? "Not set"}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}