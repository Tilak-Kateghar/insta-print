import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-xl border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-white border-gray-200 text-charcoal-900",
        destructive:
          "border-red-200 bg-red-50 text-red-800 [&>svg]:text-red-600",
        info: "border-info-200 bg-info-50 text-info-800 [&>svg]:text-info-600",
        success: "border-success-200 bg-success-50 text-success-800 [&>svg]:text-success-600",
        warning: "border-warning-200 bg-warning-50 text-warning-800 [&>svg]:text-warning-600",
        danger: "border-red-200 bg-red-50 text-red-800 [&>svg]:text-red-600",
        error: "border-red-200 bg-red-50 text-red-800 [&>svg]:text-red-600",
        // Zomato-style alerts
        tomato: "border-tomato-200 bg-tomato-50 text-tomato-800 [&>svg]:text-tomato-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-semibold leading-none tracking-tight text-charcoal-900", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed text-charcoal-700", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }