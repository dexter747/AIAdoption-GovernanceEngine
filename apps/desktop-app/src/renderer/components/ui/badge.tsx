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
          "border-transparent bg-zinc-900/40 text-zinc-400 border-zinc-800/50 hover:bg-zinc-900/50",
        outline: "text-foreground border-border",
        success: "border-transparent bg-zinc-900/40 text-zinc-400 border-zinc-800/50",
        warning: "border-transparent bg-zinc-900/40 text-zinc-400 border-zinc-800/50",
        info: "border-transparent bg-zinc-900/40 text-zinc-400 border-zinc-800/50",
        purple: "border-transparent bg-zinc-900/40 text-zinc-400 border-zinc-800/50",
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
