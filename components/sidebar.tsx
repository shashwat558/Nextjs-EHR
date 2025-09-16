"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Home, Users, Calendar, UserCheck, Pill, AlertTriangle, Menu, Stethoscope, DollarSign } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home, badge: null },
  { name: "Patients", href: "/patients", icon: Users, badge: null },
  { name: "Appointments", href: "/appointments", icon: Calendar, badge: null },
  { name: "Providers", href: "/providers", icon: UserCheck, badge: null },
  { name: "Medications", href: "/medications", icon: Pill, badge: null },
  { name: "Allergies", href: "/allergies", icon: AlertTriangle, badge: "8" },
  { name: "Billing", href: "/billing", icon: DollarSign, badge: null },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12 min-h-screen", className)}>
      <div className="space-y-4 py-6">
        <div className="px-6">
          <div className="flex items-center gap-3 px-2 mb-8">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">HealthCare Pro</h2>
              <p className="text-xs text-muted-foreground">Medical Management</p>
            </div>
          </div>

          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        isActive
                          ? "text-primary-foreground"
                          : "text-muted-foreground group-hover:text-sidebar-accent-foreground",
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <Badge
                      variant={isActive ? "secondary" : "outline"}
                      className={cn(
                        "text-xs px-2 py-0.5 font-medium",
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20"
                          : "bg-muted text-muted-foreground border-border",
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="bg-sidebar border-r border-sidebar-border h-full">
          <Sidebar />
        </div>
      </SheetContent>
    </Sheet>
  )
}
