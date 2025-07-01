import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: "SalesPulse - Smart Sales Goal Tracking",
  description: "Track and achieve your sales goals with intelligent automation and real-time insights",
  keywords: "sales tracking, goal setting, CRM, sales automation, activity tracking",
  authors: [{ name: "SalesPulse Team" }],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
