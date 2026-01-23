import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-charcoal-700">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-lg border bg-white px-4 py-2 text-sm ring-offset-white placeholder:text-charcoal-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
            error 
              ? "border-red-500 focus-visible:ring-red-500" 
              : "border-gray-200 hover:border-gray-300",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
