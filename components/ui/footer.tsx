import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-3">
            <Image 
              src="/icon_640.png" 
              alt="Time is Money Logo" 
              width={24} 
              height={24}
              className="rounded"
            />
            <div className="text-center md:text-left">
              <div className="text-lg font-semibold">Time is Money</div>
              <p className="text-sm text-muted-foreground">
                Make smarter purchasing decisions
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground md:items-end">
            <p>© 2024 Time is Money. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-foreground">Privacy</a>
              <a href="#" className="hover:text-foreground">Terms</a>
              <a href="#" className="hover:text-foreground">Support</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}