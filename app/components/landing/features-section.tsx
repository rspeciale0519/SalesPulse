"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, Target, Zap, Users, TrendingUp, Phone } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

const features = [
  {
    icon: Target,
    title: "Smart Goal Setting",
    description:
      "Set income goals and automatically calculate required calls, appointments, and deals with industry-specific formulas.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Tracking",
    description:
      "Monitor your progress with live dashboards that sync with your existing tools like RingCentral and Twilio.",
  },
  {
    icon: TrendingUp,
    title: "Catch-Up Intelligence",
    description:
      "Fall behind? Our smart catch-up system redistributes your targets across remaining workdays automatically.",
  },
  {
    icon: Zap,
    title: "What-If Scenarios",
    description:
      "Test different income targets and conversion rates to optimize your sales strategy before committing.",
  },
  {
    icon: Users,
    title: "Industry Modules",
    description:
      "Specialized workflows for Insurance, Real Estate, Solar, and more industries with custom calculations.",
  },
  {
    icon: Phone,
    title: "Activity Automation",
    description: "Automatically log calls, appointments, and deals from your existing sales tools and CRM systems.",
  },
]

export function FeaturesSection() {
  const { actualTheme } = useTheme()

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">
            Everything You Need to Hit Your Numbers
          </h2>
          <p className="text-xl text-theme-secondary max-w-3xl mx-auto">
            Stop guessing at your daily activities. Our intelligent platform calculates exactly what you need to do
            each day to reach your goals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Card
                key={index}
                className={`glass border-0 transition-all duration-300 hover:scale-105 ${
                  actualTheme === "dark" ? "bg-zinc-900/50 hover:bg-zinc-900/70" : "bg-white/50 hover:bg-white/70"
                }`}
              >
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-theme-primary mb-3">{feature.title}</h3>
                  <p className="text-theme-secondary leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
