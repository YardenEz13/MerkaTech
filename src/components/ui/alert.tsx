import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3.5 text-sm grid shadow-md transition-all duration-300 has-[>svg]:grid-cols-[20px_1fr_auto] grid-cols-[0_1fr_auto] has-[>svg]:gap-x-3 gap-y-1 items-start [&>svg]:size-5 [&>svg]:translate-y-0.5 [&>svg]:text-current animate-in fade-in-50 slide-in-from-top-5",
  {
    variants: {
      variant: {
        default: "bg-background/95 backdrop-blur-sm border-border text-foreground",
        
        destructive:
          "bg-gradient-to-r from-red-50 to-red-50/80 border-red-200/70 text-red-900 [&>svg]:text-red-500 *:data-[slot=alert-description]:text-red-700/80 dark:bg-gradient-to-r dark:from-red-950/90 dark:to-red-900/70 dark:border-red-800/60 dark:text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.15)]",
          
        success:
          "bg-gradient-to-r from-green-50 to-green-50/80 border-green-200/70 text-green-900 [&>svg]:text-green-500 *:data-[slot=alert-description]:text-green-700/80 dark:bg-gradient-to-r dark:from-green-950/90 dark:to-green-900/70 dark:border-green-800/60 dark:text-green-200 shadow-[0_0_15px_rgba(34,197,94,0.15)]",
          
        warning:
          "bg-gradient-to-r from-amber-50 to-amber-50/80 border-amber-200/70 text-amber-900 [&>svg]:text-amber-500 *:data-[slot=alert-description]:text-amber-700/80 dark:bg-gradient-to-r dark:from-amber-950/90 dark:to-amber-900/70 dark:border-amber-800/60 dark:text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
          
        info:
          "bg-gradient-to-r from-blue-50 to-blue-50/80 border-blue-200/70 text-blue-900 [&>svg]:text-blue-500 *:data-[slot=alert-description]:text-blue-700/80 dark:bg-gradient-to-r dark:from-blue-950/90 dark:to-blue-900/70 dark:border-blue-800/60 dark:text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.15)]",
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
  icon?: React.ReactNode
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, dismissible = false, onDismiss, icon, children, ...props }, ref) => {
    // Default icons based on variant
    const getDefaultIcon = () => {
      if (!variant || variant === "default") return null;
      
      switch (variant) {
        case "destructive":
          return <AlertCircle className="h-5 w-5" />;
        case "success":
          return <CheckCircle className="h-5 w-5" />;
        case "warning":
          return <AlertTriangle className="h-5 w-5" />;
        case "info":
          return <Info className="h-5 w-5" />;
        default:
          return null;
      }
    };

    return (
      <div
        ref={ref}
        data-slot="alert"
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {icon || getDefaultIcon()}
        {children}
        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className="col-start-3 row-start-1 flex h-6 w-6 items-center justify-center rounded-full opacity-70 ring-offset-background transition-all duration-200 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-black/10 dark:hover:bg-white/10 hover:scale-110"
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
        "col-start-2 row-start-1 font-semibold leading-none tracking-tight mb-1.5",
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