import React from "react";

type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function LoadingSpinner({
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses =
    size === "sm"
      ? "h-4 w-4 border-2"
      : size === "lg"
        ? "h-12 w-12 border-4"
        : "h-8 w-8 border-4";

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses} animate-spin rounded-full border-gray-300 border-t-blue-600`}
        aria-label="Loading"
        role="status"
      />
    </div>
  );
}
