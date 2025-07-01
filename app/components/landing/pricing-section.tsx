"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

const pricingPlans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for individual sales professionals",
    features: [
      "Goal calculator",
      "Activity tracking",
      "Basic reporting",
      "Email support",
      "2 industry modules",
    ],
    popular: false,
  },
  {
    name: "Professional",
    price: "$79",
    period: "/month",
    description: "For serious sales professionals",
    features: [
      "Everything in Starter",
      "Advanced analytics",
      "Catch-up intelligence",
      "What-if scenarios",
      "Priority support",
      "All industry modules",
    ],
    popular: true,
  },
  {
    name: "Team",
    price: "$199",
    period: "/month",
    description: "For sales teams and managers",
    features: [
      "Everything in Professional",
      "Team dashboards",
      "Manager insights",
      "Custom reporting",
      "API access",
      "Dedicated support",
    ],
    popular: false,
  },
]

export function PricingSection() {
  const { actualTheme } = useTheme()

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-theme-secondary max-w-3xl mx-auto">
            Choose the plan that fits your sales goals. Start free, upgrade when you're ready to scale.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan, index) => (
            <Card
              key={index}
              className={`relative glass border-0 transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? "ring-2 ring-primary scale-105"
                  : actualTheme === "dark"
                  ? "bg-zinc-900/50"
                  : "bg-white/50"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 gradient-primary text-white">
                  Most Popular
                </Badge>
              )}
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-theme-primary mb-2">{plan.name}</h3>
                  <p className="text-theme-secondary mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-theme-primary">{plan.price}</span>
                    <span className="text-theme-secondary">{plan.period}</span>
                  </div>
                  <Button
                    className={`w-full ${
                      plan.popular ? "gradient-primary hover:opacity-90" : "variant-outline"
                    }`}
                  >
                    {plan.popular ? "Start Free Trial" : "Get Started"}
                  </Button>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-theme-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
