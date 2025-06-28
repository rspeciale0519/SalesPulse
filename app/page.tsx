"use client"

import { useState } from "react"
import { LoginModal } from "@/components/auth/login-modal"
import { Navigation } from "@/app/components/landing/navigation"
import { HeroSection } from "@/app/components/landing/hero-section"
import { FeaturesSection } from "@/app/components/landing/features-section"
import { PricingSection } from "@/app/components/landing/pricing-section"
import { TestimonialsSection } from "@/app/components/landing/testimonials-section"
import { CTASection } from "@/app/components/landing/cta-section"

const LandingPage = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const handleLoginClick = () => {
    setIsLoginModalOpen(true)
  }

  return (
    <div className="min-h-screen">
      <Navigation onLoginClick={handleLoginClick} />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <LoginModal isOpen={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
    </div>
  )
}

export default LandingPage
