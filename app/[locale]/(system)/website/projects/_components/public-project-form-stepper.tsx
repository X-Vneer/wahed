"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

type PublicProjectFormStepperProps = {
  steps: readonly string[]
  currentStep: number
  onStepSelect: (index: number) => void
  navAriaLabel: string
}

export function PublicProjectFormStepper({
  steps,
  currentStep,
  onStepSelect,
  navAriaLabel,
}: PublicProjectFormStepperProps) {
  const total = steps.length

  return (
    <nav
      aria-label={navAriaLabel}
      className="w-full overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ol className="flex min-w-min items-start gap-0 sm:items-center">
        {steps.map((label, index) => {
          const isComplete = index < currentStep
          const isCurrent = index === currentStep
          const canGoBack = index < currentStep

          return (
            <li
              key={index}
              className="flex min-w-0 flex-1 items-center last:flex-none sm:last:flex-1"
            >
              <div className="flex min-w-0 flex-1 flex-col items-center gap-1 sm:flex-row sm:gap-2">
                <button
                  type="button"
                  disabled={!canGoBack}
                  onClick={() => {
                    if (canGoBack) onStepSelect(index)
                  }}
                  className={cn(
                    "focus-visible:ring-ring flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                    isCurrent &&
                      "border-primary bg-primary text-primary-foreground",
                    isComplete &&
                      !isCurrent &&
                      "border-primary bg-background text-primary hover:bg-muted/60",
                    !isCurrent &&
                      !isComplete &&
                      "border-muted-foreground/30 bg-muted/30 text-muted-foreground",
                    canGoBack && "cursor-pointer",
                    !canGoBack && !isCurrent && "cursor-default"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`${index + 1}. ${label}`}
                >
                  {isComplete ? (
                    <Check className="size-4" aria-hidden />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </button>
                <span
                  className={cn(
                    "text-muted-foreground line-clamp-2 max-w-22 text-center text-xs sm:max-w-30 sm:text-start sm:text-sm",
                    isCurrent && "text-foreground font-medium"
                  )}
                >
                  {label}
                </span>
              </div>
              {index < total - 1 ? (
                <div
                  className={cn(
                    "bg-border mx-1 hidden h-0.5 min-w-3 flex-1 sm:mx-2 sm:block sm:min-w-4",
                    index < currentStep ? "bg-primary/70" : "opacity-40"
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
