export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <span className="font-bold text-gray-900">Time is Money</span>
          
          <div className="flex items-center gap-3">
            <a 
              href="https://github.com/phrazzld/timeismoney" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              GitHub
            </a>
            <span className="text-gray-400">·</span>
            <a 
              href="https://github.com/phrazzld/timeismoney/blob/master/PRIVACY.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Privacy
            </a>
            <span className="text-gray-400">·</span>
            <a 
              href="https://github.com/phrazzld/timeismoney/issues" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Support
            </a>
          </div>
          
          <span className="text-xs text-gray-500">© 2025</span>
        </div>
      </div>
    </footer>
  );
}