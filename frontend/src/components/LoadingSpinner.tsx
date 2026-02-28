type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function LoadingSpinner({
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  const dims =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-10 w-10" : "h-6 w-6";
  const border = size === "sm" ? "border-2" : "border-4";

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div
        className={`${dims} ${border} animate-spin rounded-full border-white/30 border-t-white`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
