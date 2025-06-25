"use client"

import Link from "next/link"
import { ConnectWalletButton } from "@/components/connect-wallet-button-v2"
import { SiteLogo } from "@/components/site-logo"
import { ThemeToggleSimple } from "@/components/theme-toggle-simple"
import { useWallet } from "@/contexts/wallet-context"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

export function SiteHeader() {
  const { isAdmin } = useWallet()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <SiteLogo />
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm">
          <Link href="/" className="transition-colors hover:text-foreground/80 whitespace-nowrap">
            Home
          </Link>
          <Link href="/artists" className="transition-colors hover:text-foreground/80 whitespace-nowrap">
            Artist Profiles
          </Link>
          <Link href="/previous-auctions" className="transition-colors hover:text-foreground/80 whitespace-nowrap">
            Previous Auctions
          </Link>
          <Link href="/submit-artwork" className="transition-colors hover:text-foreground/80 whitespace-nowrap">
            Submit Artwork
          </Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggleSimple />
          {isAdmin && (
            <Button asChild variant="outline" size="sm" className="hidden sm:flex">
              <Link href="/admin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden lg:inline">Admin</span>
              </Link>
            </Button>
          )}
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  )
}
