"use client";

import React from "react";
import Image from "next/image";
import { ChromeInstallButton } from "@/components/ui/chrome-install-button";
import { Footer } from "@/components/ui/footer";
import { Clock } from "lucide-react";

const DRAMATIC_EXAMPLES = [
  { price: "$299", time: "18 hours", item: "AirPods Pro" },
  { price: "$899", time: "54 hours", item: "iPhone" },
  { price: "$1,299", time: "79 hours", item: "MacBook" },
  { price: "$45", time: "3 hours", item: "dinner out" },
  { price: "$159", time: "10 hours", item: "designer shoes" },
  { price: "$2,500", time: "152 hours", item: "vacation" },
];

const TIME_THIEVES = [
  { 
    name: "Streaming services",
    desc: "Netflix, Spotify, Disney+, etc.",
    monthly: 50,
    hours: 2,
    yearly: 24,
    icon: "📺"
  },
  {
    name: "Daily coffee",
    desc: "That $5 morning ritual",
    monthly: 150,
    hours: 6,
    yearly: 72,
    icon: "☕"
  },
  {
    name: "Food delivery fees",
    desc: "Convenience charges add up",
    monthly: 80,
    hours: 3.2,
    yearly: 38.4,
    icon: "🚗"
  },
  {
    name: "Unused gym membership",
    desc: "Haven't gone in months",
    monthly: 40,
    hours: 1.6,
    yearly: 19.2,
    icon: "💪"
  },
  {
    name: "Impulse shopping",
    desc: "Those \"small\" purchases",
    monthly: 200,
    hours: 8,
    yearly: 96,
    icon: "🛍️"
  },
  {
    name: "Subscription boxes",
    desc: "Monthly surprises you forget about",
    monthly: 35,
    hours: 1.4,
    yearly: 16.8,
    icon: "📦"
  }
];

function HiddenTimeThieves() {
  const [showYearly, setShowYearly] = React.useState(false);
  const [totalHours, setTotalHours] = React.useState(0);
  
  React.useEffect(() => {
    const total = TIME_THIEVES.reduce((sum, item) => sum + (showYearly ? item.yearly : item.hours), 0);
    const interval = setInterval(() => {
      setTotalHours(prev => {
        if (prev < total) {
          return Math.min(prev + total / 20, total);
        }
        return total;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [showYearly]);
  
  return (
    <div className="space-y-8">
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setShowYearly(false)}
          className={`px-6 py-2 rounded-full font-semibold transition-all ${
            !showYearly 
              ? 'bg-gray-900 text-white' 
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setShowYearly(true)}
          className={`px-6 py-2 rounded-full font-semibold transition-all ${
            showYearly 
              ? 'bg-gray-900 text-white' 
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          Yearly
        </button>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TIME_THIEVES.map((thief, index) => (
          <div 
            key={index}
            className="group bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-gray-400 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">{thief.icon}</span>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">{thief.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{thief.desc}</p>
                <div className="space-y-2">
                  <div className="text-2xl font-black text-gray-900">
                    {showYearly ? thief.yearly : thief.hours} hours
                  </div>
                  <div className="text-xs text-gray-500">
                    ${thief.monthly}{showYearly ? '/mo' : ' per month'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-900 rounded-3xl p-8 text-center text-white">
        <p className="text-lg mb-2 text-gray-300">Total time cost:</p>
        <div className="text-5xl md:text-6xl font-black mb-4">
          {Math.round(totalHours)} hours
        </div>
        <p className="text-xl text-gray-300">
          {showYearly 
            ? `That's ${Math.round(totalHours / 40)} full work weeks per year`
            : `Every single month`
          }
        </p>
        <p className="text-sm mt-4 text-gray-400">
          For things you barely think about.
        </p>
      </div>
    </div>
  );
}

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
                  <ChromeInstallButton size="large" variant="dark" showArrow />
                  
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
        <section className="relative px-6 py-12 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-transparent to-gray-900/50 pointer-events-none"></div>
          <div className="relative mx-auto max-w-5xl text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">As Featured In</p>
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 mb-8">
              <a 
                href="https://finance.yahoo.com/news/time-is-money-chrome-extension-tells-you-how-many-102539694524.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-bold text-gray-300 hover:text-white transition-all duration-300 hover:scale-105"
              >
                Yahoo Finance
              </a>
              <span className="text-gray-600 hidden md:inline">•</span>
              <a 
                href="https://www.fastcompany.com/3038475/by-turning-minutes-into-moolah-this-chrome-extension-helps-you-save"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-bold text-gray-300 hover:text-white transition-all duration-300 hover:scale-105"
              >
                Fast Company
              </a>
              <span className="text-gray-600 hidden md:inline">•</span>
              <a 
                href="https://www.freetech4teachers.com/2014/11/time-is-money-chrome-extension-that.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-bold text-gray-300 hover:text-white transition-all duration-300 hover:scale-105"
              >
                Free Tech 4 Teachers
              </a>
            </div>
            <blockquote className="relative max-w-3xl mx-auto">
              <div className="text-lg md:text-xl text-gray-200 italic font-light leading-relaxed">
                &ldquo;It&apos;s easier to think in terms of not wasting time rather than money.&rdquo;
              </div>
              <cite className="block mt-3 text-sm font-medium not-italic text-gray-400">— Fast Company</cite>
            </blockquote>
          </div>
        </section>

        {/* Hidden Costs */}
        <section className="px-6 py-32 bg-white relative">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                The costs you never calculate
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                These recurring expenses silently steal hours from your life every month
              </p>
            </div>
            
            <HiddenTimeThieves />
            
            <div className="text-center mt-16">
              <p className="text-lg text-gray-600 mb-6">
                See every hidden cost before it steals your time
              </p>
              <ChromeInstallButton size="medium" variant="dark" showArrow />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="relative px-6 py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
          {/* Subtle background texture */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}></div>
          </div>
          
          <div className="relative mx-auto max-w-5xl">
            <h2 className="mb-20 text-center text-5xl font-bold text-white">
              What Users Are Saying
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 flex flex-col overflow-hidden">
                <div className="absolute top-0 left-2 text-8xl text-white/5 font-serif select-none">&ldquo;</div>
                <p className="text-gray-200 italic leading-relaxed relative z-10 flex-grow">
                  Awesome plugin! Really helps in making you more conscious about the value of your time.
                </p>
                <p className="text-sm text-white font-bold mt-6 relative z-10">— Rik</p>
              </div>
              
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 flex flex-col overflow-hidden">
                <div className="absolute top-0 left-2 text-8xl text-white/5 font-serif select-none">&ldquo;</div>
                <p className="text-gray-200 italic leading-relaxed relative z-10 flex-grow">
                  Well made and great for getting your impulse buys in check!
                </p>
                <p className="text-sm text-white font-bold mt-6 relative z-10">— Eden</p>
              </div>
              
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 flex flex-col overflow-hidden">
                <div className="absolute top-0 left-2 text-8xl text-white/5 font-serif select-none">&ldquo;</div>
                <p className="text-gray-200 italic leading-relaxed relative z-10 flex-grow">
                  Converts salaries on job boards, so you can see how long it would take to earn that much.
                </p>
                <p className="text-sm text-white font-bold mt-6 relative z-10">— Jordan</p>
              </div>
              
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 flex flex-col overflow-hidden">
                <div className="absolute top-0 left-2 text-8xl text-white/5 font-serif select-none">&ldquo;</div>
                <p className="text-gray-200 italic leading-relaxed relative z-10 flex-grow">
                  Love the simplicity! Enter your per hour income and see online prices in their true value.
                </p>
                <p className="text-sm text-white font-bold mt-6 relative z-10">— Anne</p>
              </div>
              
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 flex flex-col overflow-hidden">
                <div className="absolute top-0 left-2 text-8xl text-white/5 font-serif select-none">&ldquo;</div>
                <p className="text-gray-200 italic leading-relaxed relative z-10 flex-grow">
                  Put in how much you make an hour and it shows up on any site. Great way to think about purchases.
                </p>
                <p className="text-sm text-white font-bold mt-6 relative z-10">— Sean</p>
              </div>
              
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 flex flex-col overflow-hidden">
                <div className="absolute top-0 left-2 text-8xl text-white/5 font-serif select-none">&ldquo;</div>
                <p className="text-gray-200 italic leading-relaxed relative z-10 flex-grow">
                  Time to start saving money! Works great for USD.
                </p>
                <p className="text-sm text-white font-bold mt-6 relative z-10">— Jason</p>
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

        {/* Final CTA */}
        <section className="relative px-6 py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
          {/* Dotted background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="mb-12">
              <h2 className="text-5xl md:text-7xl font-black text-white mb-6">
                Stop Trading Time<br />
                <span className="text-gray-300">For Things You Don&apos;t Need</span>
              </h2>
              <p className="text-2xl text-gray-300 font-light max-w-2xl mx-auto">
                Every purchase is a choice. Make yours count.
              </p>
            </div>

            <div className="space-y-6">
              <ChromeInstallButton size="large" variant="light" showArrow>
                Add to Chrome Now
              </ChromeInstallButton>
              
              <div className="flex items-center justify-center gap-6 text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>30-second install</span>
                </div>
                <span className="text-gray-500">•</span>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Free forever</span>
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