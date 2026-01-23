"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/ui/FileUpload";

type Vendor = {
  id: string;
  shopName: string;
};

export default function NewPrintJobPage() {
  const router = useRouter();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorId, setVendorId] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [copies, setCopies] = useState(1);
  const [colorMode, setColorMode] = useState("COLOR");
  const [paperSize, setPaperSize] = useState("A4");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ vendors: Vendor[] }>("/vendors/public")
      .then((res) => setVendors(res.vendors))
      .catch(() => setError("Failed to load vendors"));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file || !vendorId) {
      setError("Select vendor and upload file");
      return;
    }

    console.log("SUBMITTING JOB WITH:", {
      vendorId,
      copies,
      colorMode,
      paperSize,
      fileName: file.name,
    });

    const fd = new FormData();
    fd.append("file", file);
    fd.append("vendorId", vendorId);
    fd.append("copies", String(copies));
    fd.append("colorMode", colorMode);
    fd.append("paperSize", paperSize);

    try {
      setLoading(true);
      await apiFetch("/print-jobs", {
        method: "POST",
        body: fd,
      });
      router.replace("/user/jobs");
    } catch (err: any) {
      setError(err.message || "Internal server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto space-y-4">
      <h1 className="text-xl font-semibold">New Print Job</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FileUpload onFileSelect={setFile} selectedFile={file} />

        <select
          value={vendorId}
          onChange={(e) => setVendorId(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="">Select Print Shop</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.shopName}
            </option>
          ))}
        </select>

        <input
          type="number"
          min={1}
          value={copies}
          onChange={(e) => setCopies(Number(e.target.value))}
          className="border p-2 rounded w-full"
        />

        <select
          value={colorMode}
          onChange={(e) => setColorMode(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="COLOR">Color</option>
          <option value="BLACK_WHITE">Black & White</option>
        </select>

        <select
          value={paperSize}
          onChange={(e) => setPaperSize(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="A4">A4</option>
          <option value="A3">A3</option>
        </select>

        {error && <p className="text-red-600">{error}</p>}

        <button
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {loading ? "Creating..." : "Create Job"}
        </button>
      </form>
    </div>
  );
}