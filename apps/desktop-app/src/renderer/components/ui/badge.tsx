import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-red-900/30 text-red-400 border-red-800/30 hover:bg-red-900/50",
        outline: "text-foreground border-border",
        success: "border-transparent bg-emerald-900/30 text-emerald-400 border-emerald-800/30",
        warning: "border-transparent bg-amber-900/30 text-amber-400 border-amber-800/30",
        info: "border-transparent bg-blue-900/30 text-blue-400 border-blue-800/30",
        purple: "border-transparent bg-purple-900/30 text-purple-400 border-purple-800/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
