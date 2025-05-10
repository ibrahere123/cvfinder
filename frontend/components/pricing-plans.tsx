"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, HelpCircle } from "lucide-react"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function PricingPlans() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly")

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small teams and startups",
      price: billingCycle === "monthly" ? 49 : 39,
      features: ["Up to 500 resumes", "Basic AI ranking", "Email support", "1 database connection", "Basic analytics"],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Professional",
      description: "Ideal for growing companies",
      price: billingCycle === "monthly" ? 99 : 79,
      features: [
        "Up to 5,000 resumes",
        "Advanced AI ranking",
        "Priority email support",
        "3 database connections",
        "Advanced analytics",
        "Custom fields",
        "Team collaboration",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      description: "For large organizations",
      price: billingCycle === "monthly" ? 249 : 199,
      features: [
        "Unlimited resumes",
        "Premium AI ranking",
        "24/7 phone & email support",
        "Unlimited database connections",
        "Advanced analytics & reporting",
        "Custom fields & workflows",
        "Team collaboration",
        "API access",
        "Dedicated account manager",
        "Custom integrations",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * i,
        duration: 0.5,
      },
    }),
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                billingCycle === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                billingCycle === "annual" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setBillingCycle("annual")}
            >
              Annual <span className="text-emerald-600 font-medium">(Save 20%)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div key={plan.name} custom={i} initial="hidden" animate="visible" variants={fadeInUp}>
              <Card
                className={`relative h-full flex flex-col ${
                  plan.popular ? "border-emerald-500 shadow-lg shadow-emerald-100" : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-gray-500 ml-2">/ month</span>
                    {billingCycle === "annual" && <div className="text-sm text-emerald-600 mt-1">Billed annually</div>}
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="h-5 w-5 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full py-6 ${
                      plan.popular ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-900 hover:bg-gray-800"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex items-center text-gray-600 border-b border-dashed border-gray-400 cursor-help">
                  Need a custom plan?
                  <HelpCircle className="h-4 w-4 ml-1" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Contact our sales team for custom pricing tailored to your specific needs.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p className="mt-2">
            <Button variant="link" className="text-emerald-600 hover:text-emerald-700">
              Contact our sales team
            </Button>
          </p>
        </div>
      </div>
    </section>
  )
}
