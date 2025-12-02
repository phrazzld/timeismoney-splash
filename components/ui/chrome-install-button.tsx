"use client";

import React from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChromeInstallButtonProps {
  size?: "small" | "medium" | "large";
  variant?: "dark" | "light";
  showArrow?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const CHROME_STORE_URL = "https://chromewebstore.google.com/detail/time-is-money/ooppbnomdcjmoepangldchpmjhkeendl?hl=en";

export function ChromeInstallButton({
  size = "medium",
  variant = "dark",
  showArrow = true,
  className,
  children
}: ChromeInstallButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = () => {
    setIsLoading(true);
    // Brief loading state for feedback
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = CHROME_STORE_URL;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Reset after opening
      setTimeout(() => setIsLoading(false), 500);
    }, 150);
  };

  const sizeClasses = {
    small: "px-6 py-3 text-base",
    medium: "px-8 py-4 text-lg",
    large: "px-12 py-5 text-xl"
  };

  const variantClasses = {
    dark: "bg-black text-white hover:bg-gray-900 shadow-lg hover:shadow-xl border-2 border-black",
    light: "bg-white text-black hover:bg-gray-50 shadow-lg hover:shadow-xl border-2 border-gray-200"
  };

  const arrowSize = {
    small: "h-4 w-4 ml-2",
    medium: "h-5 w-5 ml-2",
    large: "h-6 w-6 ml-3"
  };

  return (
    <Button
      size="lg"
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "group font-semibold transition-all duration-200 cursor-pointer rounded-xl",
        "hover:scale-[1.02] active:scale-[0.98]",
        sizeClasses[size],
        variantClasses[variant],
        isLoading && "opacity-90",
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className={cn("animate-spin", arrowSize[size])} />
          <span className="ml-2">Opening...</span>
        </>
      ) : (
        <>
          {children || "Add to Chrome - It's Free"}
          {showArrow && (
            <ArrowRight
              className={cn(
                "transition-transform duration-200 group-hover:translate-x-1",
                arrowSize[size]
              )}
            />
          )}
        </>
      )}
    </Button>
  );
}