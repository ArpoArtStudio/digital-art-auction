"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Wallet, AlertCircle } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"

export function WalletAdminAuth() {
  const { isConnected, isAdmin, connectWallet, isLoading, error } = useWallet()
  const router = useRouter()

  const handleAdminAccess = () => {
    if (isAdmin) {
      // Set admin authentication cookie for compatibility with existing system
      document.cookie = "admin-authenticated=true; path=/; max-age=86400" // 24 hours
      router.push("/admin/dashboard")
    }
  }

  if (isConnected && isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Admin Access Granted</CardTitle>
            <CardDescription>Welcome, admin! You have full access to the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleAdminAccess} className="w-full">
              Enter Admin Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isConnected && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>This wallet does not have admin privileges.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Only registered admin wallets can access the admin panel.
              </AlertDescription>
            </Alert>
            <Button 
              variant="outline" 
              className="w-full mt-4" 
              onClick={() => router.push("/")}
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Access</CardTitle>
          <CardDescription>Connect your wallet to access the admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button 
            onClick={connectWallet} 
            className="w-full flex items-center gap-2" 
            disabled={isLoading}
          >
            <Wallet className="h-4 w-4" />
            {isLoading ? "Connecting..." : "Connect Wallet"}
          </Button>
          <div className="text-center text-sm text-muted-foreground mt-4">
            Only registered admin wallets can access admin features.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
