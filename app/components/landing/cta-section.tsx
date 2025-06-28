"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export function CTASection() {
  const { actualTheme } = useTheme()

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <div
          className={`rounded-2xl p-12 glass ${
            actualTheme === "dark" ? "bg-zinc-900/50" : "bg-white/50"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-theme-primary mb-6">
            Ready to Transform Your Sales Results?
          </h2>
          <p className="text-xl text-theme-secondary mb-8 max-w-2xl mx-auto">
            Join thousands of sales professionals who've taken control of their targets and achieved their goals.
            Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gradient-primary hover:opacity-90 text-lg px-8 py-4">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className={`text-lg px-8 py-4 ${
                actualTheme === "dark"
                  ? "border-zinc-700 hover:bg-zinc-800/50"
                  : "border-gray-200 hover:bg-gray-50/50"
              }`}
            >
              Schedule a Demo
            </Button>
          </div>
          <p className="text-sm text-theme-secondary mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 pt-12 border-t border-gray-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">SP</span>
              </div>
              <span className="text-xl font-bold text-theme-primary">SalesPulse</span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-theme-secondary">
              <a href="/legal/privacy" className="hover:text-theme-primary transition-colors">
                Privacy Policy
              </a>
              <a href="/legal/terms" className="hover:text-theme-primary transition-colors">
                Terms of Service
              </a>
              <a href="/legal/cookies" className="hover:text-theme-primary transition-colors">
                Cookie Policy
              </a>
              <span>© 2024 SalesPulse. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </section>
  )
}
