import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "w-full bg-white/5 border border-outline/30 rounded-xl py-4 px-5 text-inverse-on-surface text-lg placeholder:text-outline-variant/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
