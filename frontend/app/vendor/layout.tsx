"use client";

import { LayoutWrapper } from "@/components/LayoutWrapper";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutWrapper userType="vendor">
      {children}
    </LayoutWrapper>
  );
}