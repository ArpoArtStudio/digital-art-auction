"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { BarChart3, Users, Gavel, Settings, LogOut, Menu, Home, ImageIcon, TrendingUp, Clock, MessageSquare } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
  { name: "Queue", href: "/admin/queue", icon: Clock },
  { name: "Auctions", href: "/admin/auctions", icon: Gavel },
  { name: "Artists", href: "/admin/artists", icon: Users },
  { name: "Chat", href: "/admin/chat", icon: MessageSquare },
  { name: "Analytics", href: "/admin/analytics", icon: TrendingUp },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    document.cookie = "admin-authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    router.push("/")
  }

  const Sidebar = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-4 border-b">
        <Link href="/" className="flex items-center space-x-2">
          <Home className="h-6 w-6" />
          <span className="font-bold">ArtBase Admin</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t">
        <Button onClick={handleLogout} variant="outline" className="w-full">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b px-6 lg:hidden">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <h1 className="font-semibold">Admin Panel</h1>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
