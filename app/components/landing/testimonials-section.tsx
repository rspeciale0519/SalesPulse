"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Insurance Agent",
    company: "StateWide Insurance",
    content: "SalesPulse helped me hit my annual goal 3 months early. The catch-up feature is a game-changer when I fall behind.",
    rating: 5,
  },
  {
    name: "Mike Chen",
    role: "Real Estate Broker",
    company: "Premium Properties",
    content: "Finally, a tool that understands my industry. The goal calculator is spot-on with real estate sales cycles.",
    rating: 5,
  },
  {
    name: "Jessica Williams",
    role: "Solar Sales Rep",
    company: "SunPower Solutions",
    content: "The API integration with my CRM saves me hours every week. Everything syncs automatically.",
    rating: 5,
  },
]

export function TestimonialsSection() {
  const { actualTheme } = useTheme()

  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">
            Trusted by Sales Professionals
          </h2>
          <p className="text-xl text-theme-secondary max-w-3xl mx-auto">
            Join thousands of sales professionals who've transformed their results with SalesPulse.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className={`glass border-0 transition-all duration-300 hover:scale-105 ${
                actualTheme === "dark" ? "bg-zinc-900/50" : "bg-white/50"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-theme-secondary mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-theme-primary">{testimonial.name}</p>
                  <p className="text-sm text-theme-secondary">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
