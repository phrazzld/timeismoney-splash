import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
          <span className="text-sm font-medium text-muted-foreground">Time is Money</span>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a 
              href="https://github.com/phrazzld/timeismoney" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="View source code on GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <span>© 2014</span>
          </div>
        </div>
      </div>
    </footer>
  );
}