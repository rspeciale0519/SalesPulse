import { z } from "zod"

// Define the schema for environment variables
const envSchema = z.object({
  // Next.js environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  
  // Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Supabase service role key is required"),
  
  // Optional external service keys (only required in production)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  MAILGUN_API_KEY: z.string().optional(),
  MAILGUN_DOMAIN: z.string().optional(),
  
  // Application configuration
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  
  // Security
  NEXTAUTH_SECRET: z.string().min(32, "NextAuth secret must be at least 32 characters").optional(),
  NEXTAUTH_URL: z.string().url().optional(),
})

// Type inference from schema
export type Env = z.infer<typeof envSchema>

// Validate environment variables
function validateEnv(): Env {
  try {
    const env = envSchema.parse(process.env)
    
    // Additional validation for production environment
    if (env.NODE_ENV === "production") {
      const requiredInProduction = [
        "STRIPE_SECRET_KEY",
        "STRIPE_PUBLISHABLE_KEY", 
        "MAILGUN_API_KEY",
        "MAILGUN_DOMAIN",
        "NEXT_PUBLIC_APP_URL",
        "NEXTAUTH_SECRET",
        "NEXTAUTH_URL"
      ]
      
      const missingVars = requiredInProduction.filter(
        key => !process.env[key] || process.env[key]?.trim() === ""
      )
      
      if (missingVars.length > 0) {
        throw new Error(
          `Missing required environment variables for production: ${missingVars.join(", ")}`
        )
      }
    }
    
    return env
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        err => `${err.path.join(".")}: ${err.message}`
      )
      throw new Error(
        `Environment validation failed:\n${errorMessages.join("\n")}`
      )
    }
    throw error
  }
}

// Export validated environment variables
export const env = validateEnv()

// Helper functions for environment checks
export const isProduction = () => env.NODE_ENV === "production"
export const isDevelopment = () => env.NODE_ENV === "development"
export const isTest = () => env.NODE_ENV === "test"

// Feature flags based on environment
export const features = {
  enableAnalytics: isProduction(),
  enableDevTools: isDevelopment(),
  enableTestData: isDevelopment() || isTest(),
  enableLogging: !isTest(),
  enableStripe: !!(env.STRIPE_SECRET_KEY && env.STRIPE_PUBLISHABLE_KEY),
  enableMailgun: !!(env.MAILGUN_API_KEY && env.MAILGUN_DOMAIN),
} as const

// Log environment status (only in development)
if (isDevelopment()) {
  console.log("🔧 Environment Configuration:")
  console.log(`  Node Environment: ${env.NODE_ENV}`)
  console.log(`  Supabase URL: ${env.NEXT_PUBLIC_SUPABASE_URL}`)
  console.log(`  Features enabled:`, features)
  
  // Warn about missing optional services in development
  if (!features.enableStripe) {
    console.warn("⚠️  Stripe not configured - payment features disabled")
  }
  if (!features.enableMailgun) {
    console.warn("⚠️  Mailgun not configured - email features disabled")
  }
}
