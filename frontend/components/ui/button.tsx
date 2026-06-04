import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "w-full bg-primary text-on-primary text-lg font-bold py-5 rounded-full mt-6 shadow-xl shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all duration-200",
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
