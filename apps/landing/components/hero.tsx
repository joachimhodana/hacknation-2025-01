"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoughNotation } from "react-rough-notation";
import { Icon } from "@iconify/react";

const benefits = [
  {
    title: "Automated scheduling",
    description:
      "Let customers book and manage their rides without endless emails or phone calls.",
  },
  {
    title: "Real-time insights",
    description:
      "Track demand, routes, and usage in one dashboard so you actually know what’s going on.",
  },
  {
    title: "City-grade reliability",
    description:
      "Infrastructure built for high traffic and peak hours, not just weekend side projects.",
  },
  {
    title: "Flexible integrations",
    description:
      "Connect your existing tools, CRMs, and payment providers in a few clicks.",
  },
  {
    title: "Multi-tenant ready",
    description:
      "Serve multiple cities or business units from one unified platform.",
  },
  {
    title: "Bank-level security",
    description:
      "Role-based access, audit logs and encryption by default, not as an add-on.",
  },
];

const steps = [
  {
    title: "Create your workspace",
    description:
      "Sign up, add your branding, and configure your city or fleet in a guided setup.",
  },
  {
    title: "Connect your channels",
    description:
      "Enable mobile app, web booking or internal dispatch in a few clicks.",
  },
  {
    title: "Launch & optimize",
    description:
      "Invite users, monitor performance and tweak pricing or routes as you grow.",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "For small teams testing their first city rollout.",
    highlight: false,
    features: [
      "Up to 1,000 bookings / month",
      "Basic analytics dashboard",
      "Email support",
    ],
  },
  {
    name: "Growth",
    price: "$99",
    period: "/month",
    description: "For growing operations that need predictable scaling.",
    highlight: true,
    features: [
      "Up to 10,000 bookings / month",
      "Advanced analytics & exports",
      "Priority support",
      "API & integrations",
    ],
  },
  {
    name: "Scale",
    price: "Custom",
    period: "",
    description: "For cities and fleets with complex requirements.",
    highlight: false,
    features: [
      "Unlimited bookings",
      "Dedicated account manager",
      "Custom SLAs & onboarding",
    ],
  },
];

const testimonials = [
  {
    name: "Anna Kowalska",
    role: "Head of Operations, CityRide",
    text: "We replaced three internal tools with one dashboard. Our support tickets dropped by 40% in the first month.",
  },
  {
    name: "Mateusz Nowak",
    role: "Founder, UrbanGo",
    text: "Implementation took days, not months. Drivers finally know exactly where they need to be and when.",
  },
  {
    name: "Laura Jensen",
    role: "Product Lead, MoveFast",
    text: "BydGO lets us test new pricing and routes without involving developers every single time.",
  },
];

const faqs = [
  {
    question: "How long does it take to get started?",
    answer:
      "Most teams go from signup to first live bookings in under a week. The guided setup covers the basics, and our team helps with edge cases.",
  },
  {
    question: "Do I need developers to integrate BydGO?",
    answer:
      "No. You can use the hosted app and dashboard without writing a line of code. If you want deeper integrations, our API is there when you need it.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Yes. You can upgrade or downgrade at any time. Changes are prorated so you only pay for what you actually use.",
  },
  {
    question: "Is BydGO suitable for public sector projects?",
    answer:
      "Yes. We support compliance, audit logs and permissions that cities and public operators usually require.",
  },
];

const companies = ["CityRide", "UrbanGo", "MoveFast", "MetroMove", "FleetOS"];

const stats = [
  {
    label: "rides processed monthly",
    value: "500k+",
    icon: "solar:road-square-bold-duotone",
  },
  {
    label: "cities onboarded",
    value: "40+",
    icon: "solar:buildings-3-bold-duotone",
  },
  {
    label: "platform uptime",
    value: "99.9%",
    icon: "solar:shield-check-bold-duotone",
  },
];


export default function SaasLanding() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        <section className="border-b border-border/60 mt-4 bg-background">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 py-12 md:flex-row md:px-8 md:py-16 lg:px-12 lg:py-20">
            <div className="flex-1 space-y-6">
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <Badge className="rounded-full px-3 py-1 bg-transparent text-secondary-foreground border border-accent">
                  Trusted by modern mobility teams
                </Badge>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl">
                  Elevate your city rides with{" "}
                  <span className="text-primary">
                    <RoughNotation type="underline" show={true}>
                      BydGO
                    </RoughNotation>
                  </span>
                  .
                </h1>
                <p className="max-w-xl text-sm text-muted-foreground md:text-base">
                  A single SaaS platform to schedule, manage, and analyze every
                  ride in your city. Less chaos for dispatchers, more clarity
                  for riders.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Button size="lg" variant="secondary">
                  Start free trial
                </Button>
                <Button size="lg" variant="outline">
                  Book a demo
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 text-xs text-muted-foreground md:text-sm">
                {stats.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/20">
                      <Icon
                        icon={item.icon}
                        className="h-5 w-5 text-secondary-foreground"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-base font-semibold text-foreground">
                        {item.value}
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground">
                        {item.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-secondary/20 blur-xl" />
                <img
                  src="/mockup.png"
                  alt="iPhone 15 mockup mobile app"
                  className="relative z-10 max-h-[480px] w-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* PARTNERS SECTION – MARQUEE LOGOS */}
        <section className="border-b border-border/60 bg-background py-8">
          <div className="mx-auto max-w-6xl px-6 md:px-8 lg:px-12">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Trusted by teams worldwide
            </p>

            <div className="relative mt-4 overflow-hidden">
              <div className="flex min-w-max items-center gap-6 py-4 animate-[marquee_26s_linear_infinite]">
                {companies.concat(companies).map((name, idx) => (
                  <div
                    key={`${name}-${idx}`}
                    className="flex h-10 items-center rounded-full border border-border/60 bg-secondary/10 px-6 text-sm text-muted-foreground"
                  >
                    {/* tu podmienisz na prawdziwe loga / SVG */}
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS SECTION */}
        <section
          id="features"
          className="border-b border-border/60 bg-background py-16 md:py-20"
        >
          <div className="mx-auto max-w-6xl px-6 md:px-8 lg:px-12">
            <div className="mb-8 space-y-2 md:mb-10">
              <h2 className="text-2xl font-semibold md:text-3xl">
                Focused on outcomes, not features.
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                BydGO helps operations teams cut chaos, shorten response times
                and keep passengers informed — without adding more tools to the
                stack.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {benefits.map((benefit) => (
                <Card
                  key={benefit.title}
                  className="border border-border/70 bg-secondary/5"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm md:text-base">
                      {benefit.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground md:text-sm">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="border-b border-border/60 bg-secondary/5 py-16 md:py-20"
        >
          <div className="mx-auto max-w-6xl space-y-10 px-6 md:px-8 lg:px-12">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold md:text-3xl">
                How it works
              </h2>
              <p className="text-sm text-muted-foreground md:text-base">
                Go from idea to live city deployment in three straightforward
                steps.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <Card
                  key={step.title}
                  className="relative border border-border/70 bg-background"
                >
                  <CardContent className="space-y-3 pt-6">
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                      {index + 1}
                    </div>
                    <h3 className="text-sm font-semibold md:text-base">
                      {step.title}
                    </h3>
                    <p className="text-xs text-muted-foreground md:text-sm">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section
          id="pricing"
          className="border-b border-border/60 bg-background py-16 md:py-20"
        >
          <div className="mx-auto max-w-6xl space-y-10 px-6 md:px-8 lg:px-12">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold md:text-3xl">Pricing</h2>
              <p className="text-sm text-muted-foreground md:text-base">
                Simple plans that grow with your operation. Highlighting the
                middle plan guides most users.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {pricingPlans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`flex flex-col border ${
                    plan.highlight
                      ? "border-secondary shadow-md shadow-secondary/30 bg-secondary/5"
                      : "border-border/70 bg-background"
                  }`}
                >
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-base font-semibold">
                      {plan.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col justify-between space-y-6">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-semibold">
                          {plan.price}
                        </span>
                        {plan.period && (
                          <span className="text-sm text-muted-foreground">
                            {plan.period}
                          </span>
                        )}
                      </div>
                      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex gap-2">
                            <span className="mt-[3px] inline-block h-1.5 w-1.5 rounded-full bg-secondary" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button
                      variant={plan.highlight ? "secondary" : "outline"}
                      className="w-full"
                    >
                      {plan.price === "Custom"
                        ? "Contact sales"
                        : "Choose plan"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section
          id="testimonials"
          className="border-b border-border/60 bg-secondary/5 py-16 md:py-20"
        >
          <div className="mx-auto max-w-6xl space-y-10 px-6 md:px-8 lg:px-12">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold md:text-3xl">
                Loved by teams worldwide
              </h2>
              <p className="text-sm text-muted-foreground md:text-base">
                Recent users, close to pricing, who share concrete results.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <Card
                  key={t.name}
                  className="border border-border/70 bg-background"
                >
                  <CardContent className="space-y-4 pt-6">
                    <p className="text-sm text-muted-foreground">“{t.text}”</p>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="" alt={t.name} />
                        <AvatarFallback>
                          {t.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="border-b border-border/60 bg-background py-16 md:py-20"
        >
          <div className="mx-auto max-w-3xl space-y-8 px-6 md:px-8 lg:px-0">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold md:text-3xl">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-muted-foreground md:text-base">
                Tackle major objections around cost, rollout and support.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-sm md:text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="bg-secondary py-16 md:py-20 text-secondary-foreground">
          <div className="mx-auto max-w-6xl px-6 md:px-8 lg:px-12">
            <Card className="border border-secondary-foreground/20 bg-secondary/10 px-6 py-10 md:px-10 md:py-12">
              <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold md:text-3xl">
                    Ready to see BydGO in action?
                  </h2>
                  <p className="max-w-xl text-sm md:text-base text-secondary-foreground/80">
                    Launch your first city, migrate from legacy tools, or just
                    clean up your operations stack. Start with a free 14-day
                    trial or jump straight into a guided demo.
                  </p>
                </div>
                <div className="flex flex-col gap-3 md:flex-row">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-secondary-foreground bg-secondary-foreground text-secondary"
                  >
                    Start free trial
                  </Button>
                  <Button size="lg" variant="outline">
                    Talk to sales
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border/60 bg-background py-8 text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between md:px-8 lg:px-12">
          <div className="space-y-2">
            <p className="font-semibold text-foreground">BydGO</p>
            <p>© {new Date().getFullYear()} BydGO. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap gap-8">
            <div className="space-y-1">
              <p className="font-medium text-foreground">Product</p>
              <ul className="space-y-1">
                <li>Platform overview</li>
                <li>Use cases</li>
                <li>API docs</li>
              </ul>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Company</p>
              <ul className="space-y-1">
                <li>About</li>
                <li>Careers</li>
                <li>Press</li>
              </ul>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Resources</p>
              <ul className="space-y-1">
                <li>Help center</li>
                <li>Security</li>
                <li>Status</li>
              </ul>
            </div>
          </div>
        </div>

        {/* marquee keyframes – wrzuć do globals/tailwind jak chcesz, ale tu działa od razu */}
        <style jsx global>{`
          @keyframes marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        `}</style>
      </footer>
    </div>
  );
}
