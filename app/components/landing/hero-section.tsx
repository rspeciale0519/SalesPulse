"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Play } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export function HeroSection() {
  const { actualTheme } = useTheme()
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  return (
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
                  ? "border-zinc-700 hover:bg-zinc-800/50"
                  : "border-gray-200 hover:bg-gray-50/50"
              }`}
              onClick={() => setIsVideoPlaying(true)}
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Product Demo */}
          <Card className={`glass ${actualTheme === "dark" ? "bg-zinc-900/50" : "bg-white/50"} border-0 shadow-2xl`}>
            <CardContent className="p-8">
              <div className="relative rounded-lg overflow-hidden">
                {!isVideoPlaying ? (
                  <div
                    className={`aspect-video ${
                      actualTheme === "dark" ? "bg-zinc-800" : "bg-gray-100"
                    } flex items-center justify-center cursor-pointer group transition-all duration-300 hover:scale-105`}
                    onClick={() => setIsVideoPlaying(true)}
                  >
                    <div className="text-center">
                      <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Play className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                      </div>
                      <p className="text-theme-secondary">Click to see SalesPulse in action</p>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-black flex items-center justify-center">
                    <iframe
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                      title="SalesPulse Demo"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
