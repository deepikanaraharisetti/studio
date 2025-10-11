import { cn } from "@/lib/utils";

const LoadingSpinner = ({ className, fullScreen = false }: { className?: string; fullScreen?: boolean }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className={cn("h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent", className)} />
      </div>
    );
  }
  
  return (
    <div className={cn("h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent", className)} />
  );
};

export default LoadingSpinner;
