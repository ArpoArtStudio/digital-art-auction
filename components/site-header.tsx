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
      <div className="container flex h-16 items-center justify-between">
        <SiteLogo />
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="transition-colors hover:text-foreground/80">
            Home
          </Link>
          <Link href="/artists" className="transition-colors hover:text-foreground/80">
            Artist Profiles
          </Link>
          <Link href="/previous-auctions" className="transition-colors hover:text-foreground/80">
            Previous Auctions
          </Link>
          <Link href="/submit-artwork" className="transition-colors hover:text-foreground/80">
            Submit Artwork
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggleSimple />
          {isAdmin && (
            <Button asChild variant="outline">
              <Link href="/admin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            </Button>
          )}
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  )
}
