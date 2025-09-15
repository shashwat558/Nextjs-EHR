import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { Suspense } from "react"
import "./globals.css"
import { Metadata } from "next"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "HealthCare Pro - Medical Management System",
  description: "Professional healthcare management system for medical practices",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <div className="flex h-screen bg-background">
          <div className="hidden md:flex md:w-64 md:flex-col">
            <div className="flex flex-col flex-grow bg-sidebar border-r border-sidebar-border">
              <Suspense fallback={<div>Loading...</div>}>
                <Sidebar />
              </Suspense>
            </div>
          </div>

          <div className="flex flex-col flex-1 overflow-hidden">
            <Suspense fallback={<div>Loading...</div>}>
              <Header />
            </Suspense>
            <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
          </div>
        </div>
        <Analytics />
      </body>
    </html>
  )
}