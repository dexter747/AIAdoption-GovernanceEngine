import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
 "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 disabled:pointer-events-none disabled:opacity-50",
 {
 variants: {
 variant: {
 default:
 "bg-white text-black shadow-md hover:bg-zinc-200 hover:shadow-lg active:scale-95",
 destructive:
 "bg-zinc-800 text-zinc-300 shadow-md hover:bg-zinc-700 border border-zinc-700",
 outline:
 "border border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:text-white",
 secondary:
 "bg-zinc-900 text-zinc-200 hover:bg-zinc-800",
 ghost: "hover:bg-zinc-900 text-zinc-300 hover:text-white",
 link: "text-zinc-400 underline-offset-4 hover:underline hover:text-white",
 },
 size: {
 default: "h-11 px-6 py-2.5",
 sm: "h-9 px-4 text-xs",
 lg: "h-12 px-8 text-base",
 xl: "h-14 px-10 text-lg",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
 ({ className, variant, size, ...props }, ref) => {
 return (
 <button
 className={cn(buttonVariants({ variant, size, className }))}
 ref={ref}
 {...props}
 />
 )
 }
)
Button.displayName = "Button"

export { Button, buttonVariants }
