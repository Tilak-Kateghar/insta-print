import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-tomato-500 to-tomato-600 text-white hover:from-tomato-600 hover:to-tomato-700 shadow-button hover:shadow-button-hover",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg",
        outline:
          "border-2 border-tomato-500 bg-transparent text-tomato-600 hover:bg-tomato-50 shadow-sm",
        secondary:
          "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 hover:from-gray-200 hover:to-gray-300 shadow-sm",
        ghost: "hover:bg-tomato-50 hover:text-tomato-600",
        link: "text-tomato-600 underline-offset-4 hover:underline hover:text-tomato-700",
        danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg",
        success: "bg-gradient-to-r from-success-500 to-success-600 text-white hover:from-success-600 hover:to-success-700 shadow-md hover:shadow-lg",
        warning: "bg-gradient-to-r from-warning-500 to-warning-600 text-white hover:from-warning-600 hover:to-warning-700 shadow-md hover:shadow-lg",
        info: "bg-gradient-to-r from-info-500 to-info-600 text-white hover:from-info-600 hover:to-info-700 shadow-md hover:shadow-lg",
        gradient: "bg-gradient-to-r from-tomato-500 via-deepOrange-400 to-tomato-500 text-white hover:shadow-lg",
        paper: "bg-gradient-to-r from-white to-gray-50 text-gray-900 border border-gray-200 hover:shadow-md",
        // Zomato-style primary
        primary: "bg-gradient-to-r from-tomato-500 to-deepOrange-500 text-white hover:from-tomato-600 hover:to-deepOrange-600 shadow-button hover:shadow-button-hover",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  icon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, icon, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }