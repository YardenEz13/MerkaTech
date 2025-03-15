import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative  w-full rounded-lg border px-4 py-3.5 text-sm grid shadow-sm transition-all duration-200 has-[>svg]:grid-cols-[20px_1fr_auto] grid-cols-[0_1fr_auto] has-[>svg]:gap-x-3 gap-y-1 items-start [&>svg]:size-5 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-background border-border text-foreground",
        
        destructive:
          "bg-red-950 border-red-900 text-red-900 [&>svg]:text-red-500 *:data-[slot=alert-description]:text-red-700/80 dark:bg-red-950/70 dark:border-red-600 dark:text-red-200",
          
        success:
          "bg-green-50 border-green-200 text-green-900 [&>svg]:text-green-500 *:data-[slot=alert-description]:text-green-700/80 dark:bg-green-950/70 dark:border-green-600 dark:text-green-200",
          
        warning:
          "bg-amber-50 border-amber-200 text-amber-900 [&>svg]:text-amber-500 *:data-[slot=alert-description]:text-amber-700/80 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200",
          
        info:
          "bg-blue-50 border-blue-200 text-blue-900 [&>svg]:text-blue-500 *:data-[slot=alert-description]:text-blue-700/80 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface AlertProps extends React.ComponentProps<"div">, VariantProps<typeof alertVariants> {
  dismissible?: boolean
  onDismiss?: () => void
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, dismissible = false, onDismiss, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="alert"
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {children}
        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className="col-start-3 row-start-1 flex h-6 w-6 items-center justify-center rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLDivElement, 
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="alert-title"
      className={cn(
        "col-start-2 row-start-1 font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
})
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLDivElement, 
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
})
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }