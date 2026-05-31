import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

type Props = {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  className?: string;
};

const sizes = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-10 h-10",
};

export function Loader({ size = "md", fullScreen = false, className }: Props) {
  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className={cn("animate-spin text-primary", sizes[size], className)} />
      </div>
    );
  }

  return <Loader2 className={cn("animate-spin text-primary", sizes[size], className)} />;
}
