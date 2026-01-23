"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";

type VendorEarning = {
  vendorId: string;
  totalNet: number;
};

export default function AdminVendorSettlementPage() {
  const [vendors, setVendors] = useState<VendorEarning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ vendors: VendorEarning[] }>("/admin/vendors/pending-settlement")
      .then((res) => setVendors(res.vendors))
      .finally(() => setLoading(false));
  }, []);

  async function settleVendor(vendorId: string) {
    if (!confirm("Settle this vendor?")) return;

    await apiFetch(`/print-jobs/admin/vendors/${vendorId}/settle`, {
      method: "POST",
    });

    alert("Vendor settled");
    setVendors((prev) => prev.filter(v => v.vendorId !== vendorId));
  }

  if (loading) return <p className="p-6">Loading…</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Vendor Settlements</h1>

      {vendors.length === 0 && <p>No pending settlements.</p>}

      <ul className="space-y-3">
        {vendors.map((v) => (
          <li
            key={v.vendorId}
            className="border p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-medium">Vendor ID</p>
              <p className="text-sm">₹{v.totalNet} pending</p>
            </div>

            <button
              onClick={() => settleVendor(v.vendorId)}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Settle
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}