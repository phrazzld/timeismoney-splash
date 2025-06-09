"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <Image 
            src="/icon_640.png" 
            alt="Time is Money Logo" 
            width={32} 
            height={32}
            className="rounded-lg"
          />
          <div className="text-xl font-bold">Time is Money</div>
        </div>
        
        <Button 
          size="sm"
          onClick={() => window.open('https://chromewebstore.google.com/detail/time-is-money/ooppbnomdcjmoepangldchpmjhkeendl?hl=en', '_blank')}
        >
          Download Now
        </Button>
      </div>
    </header>
  );
}