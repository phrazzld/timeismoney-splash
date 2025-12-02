"use client";

import React from "react";
import Image from "next/image";
import { ChromeInstallButton } from "@/components/ui/chrome-install-button";
import { Footer } from "@/components/ui/footer";
import { Hourglass } from "lucide-react";

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
                  <div className="font-clash text-2xl font-bold text-black">
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
      
      <div className="bg-black rounded-2xl p-8 text-center text-white">
        <p className="text-lg mb-2 text-gray-400">Total time cost:</p>
        <div className="font-clash text-5xl md:text-6xl font-bold mb-4">
          {Math.round(totalHours)} hours
        </div>
        <p className="text-xl text-gray-300">
          {showYearly
            ? `That's ${Math.round(totalHours / 40)} full work weeks per year`
            : `Every single month`
          }
        </p>
        <p className="text-sm mt-4 text-gray-500">
          For things you barely think about.
        </p>
      </div>
    </div>
  );
}

function DemoCard() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % DRAMATIC_EXAMPLES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev - 1 + DRAMATIC_EXAMPLES.length) % DRAMATIC_EXAMPLES.length);
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev + 1) % DRAMATIC_EXAMPLES.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const current = DRAMATIC_EXAMPLES[currentIndex];

  return (
    <div
      className="w-full max-w-lg"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="bg-white rounded-2xl shadow-3xl border-2 border-gray-200 overflow-hidden transform hover:shadow-4xl transition-all duration-300">
        {/* Card Header */}
        <div className="px-6 py-4 bg-black flex items-center gap-3">
          <Image
            src="/icon_640.png"
            alt="Time is Money"
            width={20}
            height={20}
            className="rounded"
          />
          <span className="text-sm font-semibold text-white">Time is Money</span>
        </div>

        <div className="p-8">
          <div className="space-y-6">
            <h3 className="font-clash text-2xl font-bold capitalize text-black">
              {current.item}
            </h3>

            <div className="space-y-5">
              <div className="font-clash text-5xl font-bold text-black">{current.price}</div>

              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <Hourglass className="h-6 w-6 text-black" />
                  <span className="font-clash text-base font-semibold text-black">Time Cost:</span>
                </div>
                <div className="font-clash text-4xl font-bold text-black mb-2">
                  {current.time}
                </div>
                <p className="text-sm text-gray-500">
                  of work based on your rate
                </p>
              </div>
            </div>
          </div>

          {/* Interactive navigation dots */}
          <div className="mt-8 flex justify-center gap-2">
            {DRAMATIC_EXAMPLES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 transition-all duration-300 rounded-full cursor-pointer hover:bg-gray-600 ${
                  index === currentIndex
                    ? "w-8 bg-black"
                    : "w-2 bg-gray-300"
                }`}
                aria-label={`View example ${index + 1}`}
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
        <section className="relative px-6 py-16 min-h-[85vh] flex items-center justify-center bg-white overflow-hidden">
          <div className="relative z-10 mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left space-y-8">
                <h1 className="font-clash text-6xl md:text-7xl font-bold tracking-tight leading-[0.95] text-black">
                  The Real Cost
                  <br />
                  of Everything
                </h1>

                <p className="text-xl md:text-2xl leading-relaxed text-gray-600">
                  That $299 gadget costs <strong className="text-black font-clash font-bold">18 hours of your life.</strong> See the real cost before you buy.
                </p>

                <div className="space-y-6">
                  <ChromeInstallButton size="large" variant="dark" showArrow />

                  {/* Trust Indicators */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-gray-500 text-sm">
                    <span>5,000+ active users</span>
                    <span className="text-gray-300">•</span>
                    <span>30-second install</span>
                    <span className="text-gray-300">•</span>
                    <span>No signup required</span>
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
        <section className="px-6 py-24 bg-gray-50 relative">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="font-clash text-4xl md:text-5xl font-bold text-black mb-6">
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
        <section className="relative px-6 py-24 bg-black overflow-hidden">
          <div className="relative mx-auto max-w-5xl">
            <h2 className="font-clash mb-16 text-center text-4xl md:text-5xl font-bold text-white">
              What Users Are Saying
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 flex flex-col">
                <p className="text-gray-300 leading-relaxed flex-grow">
                  &ldquo;Awesome plugin! Really helps in making you more conscious about the value of your time.&rdquo;
                </p>
                <p className="text-sm text-white font-bold mt-6">— Rik</p>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 flex flex-col">
                <p className="text-gray-300 leading-relaxed flex-grow">
                  &ldquo;Well made and great for getting your impulse buys in check!&rdquo;
                </p>
                <p className="text-sm text-white font-bold mt-6">— Eden</p>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 flex flex-col">
                <p className="text-gray-300 leading-relaxed flex-grow">
                  &ldquo;Converts salaries on job boards, so you can see how long it would take to earn that much.&rdquo;
                </p>
                <p className="text-sm text-white font-bold mt-6">— Jordan</p>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 flex flex-col">
                <p className="text-gray-300 leading-relaxed flex-grow">
                  &ldquo;Love the simplicity! Enter your per hour income and see online prices in their true value.&rdquo;
                </p>
                <p className="text-sm text-white font-bold mt-6">— Anne</p>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 flex flex-col">
                <p className="text-gray-300 leading-relaxed flex-grow">
                  &ldquo;Put in how much you make an hour and it shows up on any site. Great way to think about purchases.&rdquo;
                </p>
                <p className="text-sm text-white font-bold mt-6">— Sean</p>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 flex flex-col">
                <p className="text-gray-300 leading-relaxed flex-grow">
                  &ldquo;Time to start saving money! Works great for USD.&rdquo;
                </p>
                <p className="text-sm text-white font-bold mt-6">— Jason</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-6 py-24 bg-white">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-clash mb-16 text-center text-4xl md:text-5xl font-bold text-black">
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
        <section className="relative px-6 py-24 bg-black overflow-hidden">
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="mb-12">
              <h2 className="font-clash text-5xl md:text-7xl font-bold text-white mb-6">
                Stop Trading Time<br />
                <span className="text-gray-400">For Things You Don&apos;t Need</span>
              </h2>
              <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
                Every purchase is a choice. Make yours count.
              </p>
            </div>

            <div className="space-y-6">
              <ChromeInstallButton size="large" variant="light" showArrow>
                Add to Chrome Now
              </ChromeInstallButton>

              <div className="flex items-center justify-center gap-6 text-gray-500 text-sm">
                <div className="flex items-center gap-2">
                  <Hourglass className="h-4 w-4" />
                  <span>30-second install</span>
                </div>
                <span className="text-gray-600">•</span>
                <div className="flex items-center gap-2">
                  <span className="text-success">✓</span>
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