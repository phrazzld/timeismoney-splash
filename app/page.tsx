"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { ArrowRight, Clock, DollarSign, Download, Globe, Eye, Zap, Shield, Gift } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-4 py-20 text-center bg-gradient-to-b from-background to-primary/5">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Stop Spending Money,
              <br />
              Start Spending Time
            </h1>
            
            <p className="mx-auto mb-12 max-w-2xl text-xl text-muted-foreground">
              See what things really cost in hours of work, not just dollars. 
              Make smarter purchasing decisions with instant price-to-time conversion.
            </p>

            {/* Demo */}
            <Card className="mx-auto mb-12 max-w-lg border-2 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <DollarSign className="mx-auto mb-2 h-8 w-8 text-primary" />
                    <div className="text-2xl font-bold text-primary">$99</div>
                    <div className="text-sm text-muted-foreground">Price</div>
                  </div>
                  
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  
                  <div className="text-center">
                    <Clock className="mx-auto mb-2 h-8 w-8 text-slate-600" />
                    <div className="text-2xl font-bold">6 hours</div>
                    <div className="text-sm text-muted-foreground">Work time</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Button 
              size="lg" 
              className="px-8 py-6 text-lg"
              onClick={() => window.open('https://chromewebstore.google.com/detail/time-is-money/ooppbnomdcjmoepangldchpmjhkeendl?hl=en', '_blank')}
            >
              Download Now
            </Button>
            
            <p className="mt-4 text-sm text-muted-foreground">
              30-second install • No signup required • Works immediately
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="border-t bg-muted/30 px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground">
                Three simple steps to smarter spending
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
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
                  <Card key={step.title} className="border-2 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-8 text-center">
                      <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="mb-4 text-xl font-semibold">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="border-t bg-background px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Why Choose Time is Money?
              </h2>
              <p className="text-lg text-muted-foreground">
                The simplest way to make better financial decisions
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {[
                {
                  icon: Zap,
                  title: "Works Instantly",
                  description: "No setup required. Start seeing time-based prices immediately after install.",
                },
                {
                  icon: Globe,
                  title: "Universal",
                  description: "Compatible with any website that displays prices online.",
                },
                {
                  icon: Shield,
                  title: "Privacy First",
                  description: "No data collection, tracking, or personal information required.",
                },
                {
                  icon: Gift,
                  title: "Completely Free",
                  description: "No subscriptions, hidden fees, or premium features to unlock.",
                },
              ].map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <Card key={benefit.title} className="border-2 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-8">
                      <div className="flex items-start space-x-4">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="mb-2 text-xl font-semibold">{benefit.title}</h3>
                          <p className="text-muted-foreground">{benefit.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t bg-muted/30 px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">
              Ready to Make Smarter Purchases?
            </h2>
            
            <p className="mb-8 text-lg text-muted-foreground">
              Join thousands who&apos;ve already transformed their spending habits
            </p>

            <Button 
              size="lg" 
              className="mb-4 px-8 py-6 text-lg"
              onClick={() => window.open('https://chromewebstore.google.com/detail/time-is-money/ooppbnomdcjmoepangldchpmjhkeendl?hl=en', '_blank')}
            >
              Download Now
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Free Chrome extension • 30-second install • No signup required
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}