import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-gray-100 text-charcoal-800",
        secondary:
          "bg-gray-100 text-charcoal-700",
        destructive:
          "bg-red-100 text-red-700",
        outline: "border border-gray-300 text-charcoal-700",
        success: "bg-success-100 text-success-700",
        warning: "bg-warning-100 text-warning-700",
        danger: "bg-red-100 text-red-700",
        info: "bg-info-100 text-info-700",
        neutral: "bg-gray-100 text-charcoal-600",
        // Zomato-style badges
        rating: "bg-tomato-500 text-white font-bold px-2.5 py-1",
        popular: "bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-semibold shadow-sm",
        new: "bg-success-500 text-white font-semibold",
        veg: "bg-success-500 text-white",
        nonVeg: "bg-red-500 text-white",
      },
      size: {
        default: "text-xs px-2.5 py-0.5",
        sm: "text-[10px] px-2 py-0.5",
        md: "text-sm px-3 py-1",
        lg: "text-base px-4 py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  size?: "default" | "sm" | "md" | "lg" | null
}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

export { Badge, badgeVariants }