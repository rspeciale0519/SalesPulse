"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, BarChart3, Target, Zap, Users, TrendingUp, Phone, CheckCircle, Star, Play } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { LoginModal } from "@/components/auth/login-modal"

const LandingPage = () => {
  const { actualTheme } = useTheme()
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

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

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Insurance Agent",
      company: "State Farm",
      content:
        "SalesPulse helped me increase my income by 40% in just 6 months. The referral tracking alone is worth the investment.",
      rating: 5,
    },
    {
      name: "Mike Rodriguez",
      role: "Real Estate Broker",
      company: "Century 21",
      content:
        "Finally, a tool that understands sales goals aren't just about numbers. The catch-up feature saved my Q4.",
      rating: 5,
    },
    {
      name: "Jennifer Park",
      role: "Solar Sales Rep",
      company: "SunPower",
      content:
        "The what-if scenarios help me plan my territory strategy. I can see exactly what I need to hit my targets.",
      rating: 5,
    },
  ]

  const pricingPlans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for individual sales professionals",
      features: [
        "Goal calculator & tracking",
        "Manual activity logging",
        "Basic dashboard",
        "Email support",
        "1 industry module",
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
        "API integrations (RingCentral, Twilio)",
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
        "Custom integrations",
      ],
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 backdrop-blur-md transition-colors duration-300 ${
          actualTheme === "dark" ? "bg-black/80 border-b border-zinc-800" : "bg-white/80 border-b border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">SP</span>
              </div>
              <span className="text-xl font-bold text-theme-primary">SalesPulse</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-theme-secondary hover:text-theme-primary transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-theme-secondary hover:text-theme-primary transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="text-theme-secondary hover:text-theme-primary transition-colors">
                Reviews
              </a>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                className="text-theme-secondary hover:text-theme-primary"
                onClick={() => setIsLoginModalOpen(true)}
              >
                Login
              </Button>
              <Button className="gradient-primary hover:opacity-90">Start Free Trial</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 gradient-primary text-white px-4 py-2">
              🚀 Now with AI-powered catch-up intelligence
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold text-theme-primary mb-6 leading-tight">
              Turn Your Sales Goals Into
              <span className="gradient-primary bg-clip-text text-transparent"> Achievable Targets</span>
            </h1>

            <p className="text-xl text-theme-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
              The only sales tracking platform that automatically calculates your daily activities, syncs with your
              existing tools, and keeps you on track with intelligent catch-up plans.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="gradient-primary hover:opacity-90 text-lg px-8 py-4">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className={`text-lg px-8 py-4 glass ${
                  actualTheme === "dark"
                    ? "border-slate-600 text-white hover:bg-slate-800"
                    : "border-gray-300 text-black hover:bg-gray-50"
                }`}
                onClick={() => setIsVideoPlaying(true)}
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Hero Image/Video Placeholder */}
            <div className="relative max-w-5xl mx-auto">
              <Card className="glass rounded-2xl overflow-hidden shadow-2xl">
                <CardContent className="p-0">
                  <div className="aspect-video relative">
                    <img
                      src="/images/dashboard-preview.png"
                      alt="SalesPulse Dashboard Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end justify-center pb-6">
                      <Badge className="bg-red-500/90 text-white px-3 py-1">Interactive Dashboard</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">
              Everything You Need to Hit Your Targets
            </h2>
            <p className="text-xl text-theme-secondary max-w-2xl mx-auto">
              Stop guessing and start achieving with data-driven sales goal management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="glass glass-hover rounded-xl gradient-border">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-theme-primary mb-2">{feature.title}</h3>
                    <p className="text-theme-secondary">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-theme-secondary mb-8">Trusted by sales professionals at</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {["State Farm", "Century 21", "SunPower", "Allstate", "RE/MAX", "Tesla Energy"].map((company) => (
              <div key={company} className="text-2xl font-bold text-theme-primary">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">What Sales Professionals Say</h2>
            <p className="text-xl text-theme-secondary">
              Join thousands of sales professionals who've transformed their results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="glass glass-hover rounded-xl gradient-border">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-theme-secondary mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-theme-primary">{testimonial.name}</p>
                    <p className="text-sm text-theme-muted">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-theme-secondary">Choose the plan that fits your sales goals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`glass rounded-xl relative ${
                  plan.popular ? "gradient-border scale-105" : "border border-slate-700"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="gradient-primary text-white px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-theme-primary mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-theme-primary">{plan.price}</span>
                      <span className="text-theme-secondary">{plan.period}</span>
                    </div>
                    <p className="text-theme-secondary">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                        <span className="text-theme-secondary">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "gradient-primary hover:opacity-90"
                        : "glass border border-slate-600 text-theme-primary hover:bg-slate-800"
                    }`}
                  >
                    {plan.popular ? "Start Free Trial" : "Get Started"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-theme-secondary mb-4">All plans include a 14-day free trial. No credit card required.</p>
            <p className="text-sm text-theme-muted">
              Need a custom solution?{" "}
              <a href="#" className="text-red-400 hover:underline">
                Contact our sales team
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="glass rounded-2xl gradient-border">
            <CardContent className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-theme-primary mb-6">
                Ready to Transform Your Sales Results?
              </h2>
              <p className="text-xl text-theme-secondary mb-8">
                Join thousands of sales professionals who've already hit their income goals with SalesPulse.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="gradient-primary hover:opacity-90 text-lg px-8 py-4">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className={`text-lg px-8 py-4 glass ${
                    actualTheme === "dark"
                      ? "border-slate-600 text-white hover:bg-slate-800"
                      : "border-gray-300 text-black hover:bg-gray-50"
                  }`}
                >
                  Schedule a Demo
                </Button>
              </div>

              <div className="flex items-center justify-center gap-8 mt-8 text-sm text-theme-muted">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  14-day free trial
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Cancel anytime
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`py-12 px-4 sm:px-6 lg:px-8 border-t ${
          actualTheme === "dark" ? "border-zinc-800" : "border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SP</span>
                </div>
                <span className="text-xl font-bold text-theme-primary">SalesPulse</span>
              </div>
              <p className="text-theme-secondary">
                The modern sales goal tracking platform for ambitious professionals.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-theme-primary mb-4">Product</h4>
              <ul className="space-y-2 text-theme-secondary">
                <li>
                  <a href="#" className="hover:text-theme-primary transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-theme-primary transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-theme-primary transition-colors">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-theme-primary transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-theme-primary mb-4">Company</h4>
              <ul className="space-y-2 text-theme-secondary">
                <li>
                  <a href="#" className="hover:text-theme-primary transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-theme-primary transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-theme-primary transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-theme-primary transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-theme-primary mb-4">Support</h4>
              <ul className="space-y-2 text-theme-secondary">
                <li>
                  <a href="#" className="hover:text-theme-primary transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-theme-primary transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-theme-primary transition-colors">
                    Status
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-theme-primary transition-colors">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div
            className={`mt-12 pt-8 border-t ${
              actualTheme === "dark" ? "border-zinc-800" : "border-gray-200"
            } flex flex-col md:flex-row justify-between items-center`}
          >
            <p className="text-theme-muted">© 2024 SalesPulse. All rights reserved.</p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <a href="#" className="text-theme-muted hover:text-theme-primary transition-colors">
                Terms
              </a>
              <a href="#" className="text-theme-muted hover:text-theme-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="text-theme-muted hover:text-theme-primary transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
      <LoginModal isOpen={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
    </div>
  )
}

export default LandingPage
