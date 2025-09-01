"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/ui/footer";
import { ArrowRight, Clock, Download, Globe, Eye, Zap } from "lucide-react";

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
                      10,000+ active users
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

        {/* How It Works */}
        <section className="px-6 py-24 bg-white relative z-20 border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <h2 className="mb-6 text-2xl font-bold">
                How It Works
              </h2>
              <p className="text-muted-foreground">
                Three simple steps to smarter spending
              </p>
            </div>

            <div className="grid gap-12 md:grid-cols-3">
              {[
                {
                  icon: Download,
                  title: "Install Extension",
                  description: "One-click install from the Chrome Web Store. No account needed.",
                },
                {
                  icon: Globe,
                  title: "Browse Any Website", 
                  description: "Shop normally on Amazon, eBay, or any site with prices.",
                },
                {
                  icon: Eye,
                  title: "See Work Hours",
                  description: "Prices automatically show as hours of work alongside dollars.",
                },
              ].map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="text-center">
                    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-3 text-lg font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features - Bento Grid */}
        <section className="px-6 py-24 bg-slate-50">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-16 text-center text-3xl font-bold">
              Why Choose Time is Money?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 h-auto">
              {/* Large Hero Feature */}
              <div className="md:col-span-2 lg:col-span-3 md:row-span-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-8 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative">
                  <Zap className="h-12 w-12 mb-4 text-white/90" />
                  <h3 className="text-2xl font-bold mb-4">Works Instantly</h3>
                  <p className="text-white/90 text-lg">No setup required. Start seeing time-based prices immediately after install. Transform any shopping experience with a single click.</p>
                  <div className="mt-6 flex items-center gap-2 text-white/80 text-sm">
                    <span className="inline-block w-2 h-2 bg-green-300 rounded-full"></span>
                    Zero configuration
                  </div>
                </div>
              </div>

              {/* Medium Features */}
              <div className="md:col-span-2 lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 hover:border-emerald-200 hover:shadow-lg transition-all duration-300 group">
                <Globe className="h-8 w-8 mb-3 text-emerald-600 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold mb-2">Universal Compatibility</h3>
                <p className="text-gray-600 text-sm">Works on any website that displays prices - Amazon, eBay, shopping sites, and more.</p>
              </div>

              <div className="md:col-span-2 lg:col-span-1 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white relative overflow-hidden hover:scale-[1.05] transition-transform duration-300">
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/20 rounded-full blur-xl"></div>
                <div className="relative">
                  <div className="text-3xl font-bold">10K+</div>
                  <div className="text-white/90 text-sm">Active Users</div>
                </div>
              </div>

              <div className="md:col-span-2 lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold">🛡️</span>
                  </div>
                  <h3 className="text-lg font-semibold">Privacy First</h3>
                </div>
                <p className="text-gray-600 text-sm">No data collection, tracking, or personal information required. Your privacy is guaranteed.</p>
              </div>

              <div className="md:col-span-2 lg:col-span-1 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-6 text-white text-center hover:scale-[1.05] transition-transform duration-300">
                <div className="text-2xl font-bold">100%</div>
                <div className="text-white/90 text-sm">Free Forever</div>
                <div className="text-white/70 text-xs mt-1">No hidden fees</div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}