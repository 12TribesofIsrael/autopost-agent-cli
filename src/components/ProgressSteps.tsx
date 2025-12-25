import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepStatus = "completed" | "current" | "upcoming";

export interface Step {
  label: string;
  status: StepStatus;
}

interface ProgressStepsProps {
  steps: Step[];
  className?: string;
}

export default function ProgressSteps({ steps, className }: ProgressStepsProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2 sm:gap-4", className)}>
      {steps.map((step, index) => (
        <div key={step.label} className="flex items-center gap-2 sm:gap-4">
          {/* Step indicator */}
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all",
                step.status === "completed" && "bg-primary text-primary-foreground",
                step.status === "current" && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                step.status === "upcoming" && "bg-muted text-muted-foreground border border-border"
              )}
            >
              {step.status === "completed" ? (
                <Check className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            <span
              className={cn(
                "text-xs font-medium whitespace-nowrap",
                step.status === "current" && "text-primary",
                step.status === "upcoming" && "text-muted-foreground",
                step.status === "completed" && "text-foreground"
              )}
            >
              {step.label}
            </span>
          </div>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                "h-0.5 w-8 sm:w-12 transition-colors",
                step.status === "completed" ? "bg-primary" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
