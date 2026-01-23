import VendorJobDetailClient from "./vendor-job-detail-client";

export default async function VendorJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  return <VendorJobDetailClient jobId={jobId} />;
}