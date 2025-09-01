"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";
import { ArrowRight, Clock } from "lucide-react";

const DRAMATIC_EXAMPLES = [
  { price: "$299", time: "18 hours", item: "AirPods Pro" },
  { price: "$899", time: "54 hours", item: "iPhone" },
  { price: "$1,299", time: "79 hours", item: "MacBook" },
  { price: "$45", time: "3 hours", item: "dinner out" },
  { price: "$159", time: "10 hours", item: "designer shoes" },
  { price: "$2,500", time: "152 hours", item: "vacation" },
];

function DemoCard() {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % DRAMATIC_EXAMPLES.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const current = DRAMATIC_EXAMPLES[currentIndex];

  return (
    <div className="w-full max-w-lg">
      <div className="bg-white rounded-3xl shadow-3xl shadow-gray-900/30 border border-gray-300 overflow-hidden transform hover:scale-[1.02] hover:shadow-4xl hover:shadow-gray-900/40 transition-all duration-500 animate-float">
        {/* Card Header */}
        <div className="px-6 py-4 bg-gray-900 border-b border-gray-700 flex items-center gap-3">
          <Image 
            src="/icon_640.png" 
            alt="Time is Money" 
            width={20} 
            height={20}
            className="rounded-md"
          />
          <span className="text-sm font-semibold text-white">Time is Money Extension</span>
        </div>
        
        <div className="p-8">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold capitalize text-gray-900">
              {current.item}
            </h3>
            
            <div className="space-y-5">
              <div className="text-4xl font-black text-gray-900">{current.price}</div>
              
              <div className="bg-gray-100 rounded-2xl p-5 border-2 border-gray-300">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="h-6 w-6 text-gray-700" />
                  <span className="text-base font-semibold text-gray-900">Time Cost:</span>
                </div>
                <div className="text-3xl font-black text-gray-900 mb-2">
                  {current.time}
                </div>
                <p className="text-sm font-medium text-gray-700">
                  of work based on your rate
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center gap-3">
            {DRAMATIC_EXAMPLES.map((_, index) => (
              <div
                key={index}
                className={`h-2 transition-all duration-500 rounded-full ${
                  index === currentIndex 
                    ? 'w-8 bg-gray-900 shadow-lg shadow-gray-900/30' 
                    : 'w-2 bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-6 py-12 min-h-[85vh] flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dot-pattern overflow-hidden">
          {/* Subtle background elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-64 h-64 bg-gray-200 rounded-full mix-blend-multiply filter blur-xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-gray-300 rounded-full mix-blend-multiply filter blur-2xl"></div>
          </div>
          <div className="relative z-10 mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left text-gray-900 space-y-8">
                <div className="flex items-center gap-3 justify-center lg:justify-start mb-6">
                  <Image 
                    src="/icon_640.png" 
                    alt="Time is Money" 
                    width={40} 
                    height={40}
                    className="rounded-md"
                  />
                  <div className="text-xl font-semibold text-gray-900">Time is Money</div>
                </div>
                
                <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-tight text-gray-900">
                  The Real Cost
                  <br />
                  <span className="text-gray-900">of Everything</span>
                </h1>
                
                <p className="text-2xl font-medium leading-relaxed text-gray-700">
                  That $299 gadget costs <strong className="text-gray-900">18 hours of your life.</strong> See the real cost before you buy.
                </p>

                <div className="space-y-6">
                  <Button 
                    size="lg"
                    className="group bg-gray-900 text-white hover:bg-black shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 font-semibold text-xl px-12 py-5 cursor-pointer"
                    onClick={() => window.open('https://chromewebstore.google.com/detail/time-is-money/ooppbnomdcjmoepangldchpmjhkeendl?hl=en', '_blank', 'rel=noopener noreferrer')}
                  >
                    Add to Chrome - It&apos;s Free
                    <ArrowRight className="h-6 w-6 ml-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </Button>
                  
                  {/* Trust Indicators */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-gray-600 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                      5,000 active users
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                      30-second install
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                      No signup required
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Content - Demo Card */}
              <div className="flex justify-center">
                <DemoCard />
              </div>
            </div>
          </div>
        </section>

        {/* Press Section */}
        <section className="relative px-6 py-16 bg-gray-50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-gray-50/50 to-white pointer-events-none"></div>
          <div className="relative mx-auto max-w-5xl text-center">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-6">As Featured In</p>
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 mb-8">
              <a 
                href="https://finance.yahoo.com/news/time-is-money-chrome-extension-tells-you-how-many-102539694524.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-bold text-gray-400 hover:text-gray-900 transition-all duration-300 hover:scale-105"
              >
                Yahoo Finance
              </a>
              <span className="text-gray-300 hidden md:inline">•</span>
              <a 
                href="https://www.fastcompany.com/3038475/by-turning-minutes-into-moolah-this-chrome-extension-helps-you-save"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-bold text-gray-400 hover:text-gray-900 transition-all duration-300 hover:scale-105"
              >
                Fast Company
              </a>
              <span className="text-gray-300 hidden md:inline">•</span>
              <a 
                href="https://lifehacker.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-bold text-gray-400 hover:text-gray-900 transition-all duration-300 hover:scale-105"
              >
                Lifehacker
              </a>
              <span className="text-gray-300 hidden md:inline">•</span>
              <a 
                href="https://www.freetech4teachers.com/2014/11/time-is-money-chrome-extension-that.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-bold text-gray-400 hover:text-gray-900 transition-all duration-300 hover:scale-105"
              >
                Edtech
              </a>
            </div>
            <blockquote className="relative max-w-3xl mx-auto">
              <div className="text-lg md:text-xl text-gray-700 italic font-light leading-relaxed">
                &ldquo;It&apos;s easier to think in terms of not wasting time rather than money.&rdquo;
              </div>
              <cite className="block mt-3 text-sm font-medium not-italic text-gray-500">— Fast Company</cite>
            </blockquote>
          </div>
        </section>

        {/* The Math of Mindless Spending */}
        <section className="px-6 py-32 bg-white relative">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                Every purchase<br className="hidden md:block"/>is a trade.
              </h2>
              <p className="text-2xl text-gray-600 font-light">You&apos;re trading hours of your life.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-20">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative text-center p-8 rounded-3xl border-2 border-gray-200 bg-white group-hover:border-orange-300 transition-all duration-300">
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">☕</div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">Daily coffee</div>
                  <div className="text-3xl font-black text-orange-600">$5</div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500 uppercase tracking-wide mb-1">Time cost</div>
                    <div className="text-xl font-bold text-gray-900">20 minutes</div>
                  </div>
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative text-center p-8 rounded-3xl border-2 border-gray-200 bg-white group-hover:border-indigo-300 transition-all duration-300">
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">📱</div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">New iPhone</div>
                  <div className="text-3xl font-black text-indigo-600">$999</div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500 uppercase tracking-wide mb-1">Time cost</div>
                    <div className="text-xl font-bold text-gray-900">54 hours</div>
                    <div className="text-sm text-gray-500">(1+ week)</div>
                  </div>
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative text-center p-8 rounded-3xl border-2 border-gray-200 bg-white group-hover:border-pink-300 transition-all duration-300">
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">🛍️</div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">Shopping spree</div>
                  <div className="text-3xl font-black text-pink-600">$500</div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500 uppercase tracking-wide mb-1">Time cost</div>
                    <div className="text-xl font-bold text-gray-900">30 hours</div>
                    <div className="text-sm text-gray-500">(almost a week)</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl"></div>
              <div className="relative text-center p-10 rounded-3xl text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                <p className="text-2xl mb-4 font-light relative z-10">Most people never do the math.</p>
                <p className="text-4xl font-black relative z-10">This extension does it for you.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="px-6 py-32 bg-gray-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50 opacity-50"></div>
          <div className="relative mx-auto max-w-5xl">
            <div className="mb-20 text-center">
              <h2 className="text-5xl font-black text-gray-900 mb-4">
                Three Simple Steps
              </h2>
              <p className="text-xl text-gray-600">Start saving time in under 30 seconds</p>
            </div>

            <div className="relative">
              {/* Connection line */}
              <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300"></div>
              
              <div className="grid gap-12 md:grid-cols-3 relative">
                <div className="text-center group">
                  <div className="relative mb-8">
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-white border-4 border-gray-200 group-hover:border-gray-400 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                      <span className="text-6xl">🌐</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">Add Extension</h3>
                  <p className="text-lg text-gray-600 max-w-xs mx-auto">One-click install from Chrome Web Store</p>
                </div>
                
                <div className="text-center group">
                  <div className="relative mb-8">
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-white border-4 border-gray-200 group-hover:border-green-400 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                      <span className="text-6xl">💰</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">Set Your Wage</h3>
                  <p className="text-lg text-gray-600 max-w-xs mx-auto">Enter hourly rate or annual salary</p>
                </div>
                
                <div className="text-center group">
                  <div className="relative mb-8">
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-white border-4 border-gray-200 group-hover:border-blue-400 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                      <span className="text-6xl">✨</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">Shop Smarter</h3>
                  <p className="text-lg text-gray-600 max-w-xs mx-auto">See every price as hours of your life</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-6 py-28 bg-white">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-20 text-center text-5xl font-bold text-gray-900">
              What Users Are Saying
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="relative bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <div className="absolute -top-2 -left-2 text-4xl text-gray-300 font-serif">&ldquo;</div>
                <p className="text-gray-700 italic leading-relaxed relative z-10 flex-grow">
                  Awesome plugin! Really helps in making you more conscious about the value of your time.
                </p>
                <p className="text-sm text-gray-900 font-bold mt-6">— Rik</p>
              </div>
              
              <div className="relative bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <div className="absolute -top-2 -left-2 text-4xl text-gray-300 font-serif">&ldquo;</div>
                <p className="text-gray-700 italic leading-relaxed relative z-10 flex-grow">
                  Well made and great for getting your impulse buys in check!
                </p>
                <p className="text-sm text-gray-900 font-bold mt-6">— Eden</p>
              </div>
              
              <div className="relative bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <div className="absolute -top-2 -left-2 text-4xl text-gray-300 font-serif">&ldquo;</div>
                <p className="text-gray-700 italic leading-relaxed relative z-10 flex-grow">
                  Converts salaries on job boards, so you can see how long it would take to earn that much.
                </p>
                <p className="text-sm text-gray-900 font-bold mt-6">— Jordan</p>
              </div>
              
              <div className="relative bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <div className="absolute -top-2 -left-2 text-4xl text-gray-300 font-serif">&ldquo;</div>
                <p className="text-gray-700 italic leading-relaxed relative z-10 flex-grow">
                  Love the simplicity! Enter your per hour income and see online prices in their true value.
                </p>
                <p className="text-sm text-gray-900 font-bold mt-6">— Anne</p>
              </div>
              
              <div className="relative bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <div className="absolute -top-2 -left-2 text-4xl text-gray-300 font-serif">&ldquo;</div>
                <p className="text-gray-700 italic leading-relaxed relative z-10 flex-grow">
                  Put in how much you make an hour and it shows up on any site. Great way to think about purchases.
                </p>
                <p className="text-sm text-gray-900 font-bold mt-6">— Sean</p>
              </div>
              
              <div className="relative bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <div className="absolute -top-2 -left-2 text-4xl text-gray-300 font-serif">&ldquo;</div>
                <p className="text-gray-700 italic leading-relaxed relative z-10 flex-grow">
                  Time to start saving money! Works great for USD.
                </p>
                <p className="text-sm text-gray-900 font-bold mt-6">— Jason</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-6 py-28 bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-20 text-center text-5xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div className="group bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300">
                <div className="grid grid-cols-[auto,1fr] gap-3">
                  <span className="text-2xl text-gray-400 font-bold">Q:</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Does it work on all websites?</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                  Works best on major sites like Amazon US and eBay. Some international sites and currencies may have limited support. We&apos;re constantly improving compatibility.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="group bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300">
                <div className="grid grid-cols-[auto,1fr] gap-3">
                  <span className="text-2xl text-gray-400 font-bold">Q:</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Is it really free?</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                  Yes, completely free. No premium version, no ads, no data collection. It&apos;s a simple tool designed to help people make better spending decisions.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="group bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300">
                <div className="grid grid-cols-[auto,1fr] gap-3">
                  <span className="text-2xl text-gray-400 font-bold">Q:</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Why should I trust this?</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                  Open source on GitHub since 2014. Used by 5,000+ people. Featured in major publications. We never collect or track any personal data - your privacy is guaranteed.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="group bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300">
                <div className="grid grid-cols-[auto,1fr] gap-3">
                  <span className="text-2xl text-gray-400 font-bold">Q:</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">How do I set my hourly wage?</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                  After installing, click the extension icon and enter either your hourly wage or annual salary. The extension automatically calculates and displays prices in hours of work.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}