import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { WalletProvider } from "@/contexts/wallet-context"
import { BiddingProvider } from "@/contexts/bidding-context"
import { ChatProvider } from "@/contexts/chat-context"
import { Toaster } from "@/components/ui/sonner"
import { NotificationManager } from "@/components/notification-manager"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "ArtBase - Digital Art Auctions on Base Chain",
  description: "Bid on exclusive digital art pieces using Ethereum on the Base chain",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <WalletProvider>
            <BiddingProvider>
              <ChatProvider>
                {children}
                <NotificationManager />
              </ChatProvider>
            </BiddingProvider>
          </WalletProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
