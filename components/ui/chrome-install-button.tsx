"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
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
  const handleClick = () => {
    window.open(CHROME_STORE_URL, "_blank", "rel=noopener noreferrer");
  };

  const sizeClasses = {
    small: "px-6 py-3 text-base",
    medium: "px-8 py-4 text-lg",
    large: "px-12 py-5 text-xl"
  };

  const variantClasses = {
    dark: "bg-gray-900 text-white hover:bg-black shadow-xl hover:shadow-2xl",
    light: "bg-white text-gray-900 hover:bg-gray-100 shadow-2xl hover:shadow-3xl"
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
      className={cn(
        "group font-semibold transition-all duration-300 cursor-pointer",
        "hover:scale-[1.02] active:scale-[0.98]",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {children || "Add to Chrome - It's Free"}
      {showArrow && (
        <ArrowRight 
          className={cn(
            "transition-transform duration-300 group-hover:translate-x-0.5",
            arrowSize[size]
          )} 
        />
      )}
    </Button>
  );
}