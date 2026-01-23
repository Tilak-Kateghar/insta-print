"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FileText, Home, Plus, LogOut, Printer } from "lucide-react";

interface NavbarProps {
  userType: "user" | "vendor";
}

export function Navbar({ userType }: NavbarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navItems = userType === "user" ? [
    { href: "/user/dashboard", label: "Dashboard", icon: Home },
    { href: "/user/jobs", label: "My Jobs", icon: FileText },
    { href: "/user/jobs/new", label: "New Job", icon: Plus },
  ] : [
    { href: "/vendor/dashboard", label: "Dashboard", icon: Home },
    { href: "/vendor/jobs", label: "All Jobs", icon: FileText },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href={`/${userType}/dashboard`} className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-r from-tomato-500 to-deepOrange-500 rounded-lg flex items-center justify-center shadow-button group-hover:shadow-button-hover transition-all">
              <Printer className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-charcoal-900">
              <span className="text-tomato-500">Insta</span>
              <span className="text-charcoal-900">Print</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={active ? "primary" : "ghost"}
                    size="sm"
                    className={`flex items-center space-x-2 px-4 ${
                      active ? "" : "text-charcoal-600"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              if (userType === "user") {
                const { logoutUser } = await import("@/lib/auth");
                await logoutUser();
              } else {
                const { logoutVendor } = await import("@/lib/auth");
                await logoutVendor();
              }
              window.location.href = `/login/${userType}`;
            }}
            className="flex items-center space-x-2 border-gray-200 text-charcoal-600 hover:border-tomato-300 hover:text-tomato-600 hover:bg-tomato-50"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>

        <div className="md:hidden py-3 border-t border-gray-100">
          <div className="flex justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={active ? "primary" : "ghost"}
                    size="sm"
                    className="flex flex-col items-center space-y-1 h-auto py-2 px-3"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}