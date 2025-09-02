import Image from "next/image";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm backdrop-blur-sm">
      <div className="container flex h-16 items-center px-6">
        <div className="flex items-center space-x-3">
          <Image 
            src="/icon_640.png" 
            alt="Time is Money Logo" 
            width={32} 
            height={32}
            className="rounded-md"
          />
          <div className="text-lg font-semibold text-gray-900">Time is Money</div>
        </div>
      </div>
    </header>
  );
}