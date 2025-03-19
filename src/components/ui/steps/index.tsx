import React from "react";
import { cn } from "@/utils";

interface StepProps {
  title: string;
  description?: string;
  isActive?: boolean;
  isCompleted?: boolean;
  index?: number;
}

interface StepsProps {
  currentStep: number;
  children: React.ReactNode;
  className?: string;
}

export const Step: React.FC<StepProps> = ({ title, description }) => {
  // This is just a container component for semantics and doesn't render anything of its own
  return null;
};

export const Steps: React.FC<StepsProps> = ({
  currentStep,
  children,
  className,
}) => {
  // Filter out non-Step children
  const steps = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === Step
  ) as React.ReactElement<StepProps>[];

  return (
    <div className={cn("flex w-full", className)}>
      {steps.map((step, index) => {
        const isActive = currentStep === index + 1;
        const isCompleted = currentStep > index + 1;

        return (
          <div
            key={index}
            className={cn(
              "flex-1 flex flex-col items-center",
              index !== 0 && "ml-2"
            )}
          >
            <div className="relative flex items-center justify-center w-full">
              {/* Connector line before each step (except the first one) */}
              {index > 0 && (
                <div
                  className={cn(
                    "absolute h-0.5 w-full -left-[48%] top-4 -translate-y-1/2 z-0",
                    isCompleted ? "bg-green-500" : "bg-gray-300"
                  )}
                />
              )}

              {/* Step marker */}
              <div
                className={cn(
                  "relative z-1 flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium border-2 bg-white z-[2]",
                  isCompleted && "bg-green-500 border-green-500 text-white",
                  isActive && !isCompleted && "border-blue-500 text-blue-500",
                  !isActive &&
                    !isCompleted &&
                    "border-gray-300 text-gray-500 bg-white"
                )}
              >
                {isCompleted ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
            </div>

            {/* Title */}
            <div
              className={cn(
                "mt-2 text-sm font-medium text-center",
                isActive && "text-blue-500",
                isCompleted && "text-green-500",
                !isActive && !isCompleted && "text-gray-500"
              )}
            >
              {step.props.title}
            </div>

            {/* Description (if provided) */}
            {step.props.description && (
              <div className="mt-1 text-xs text-gray-500 text-center">
                {step.props.description}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
