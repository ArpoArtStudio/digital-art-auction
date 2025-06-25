"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/contexts/wallet-context"
import { Shield, Wallet, CheckCircle, XCircle } from "lucide-react"

export function AdminWalletInfo() {
  const { isConnected, walletAddress, isAdmin } = useWallet()

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Status
          </CardTitle>
          <CardDescription>Connect your wallet to see admin status</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">Not Connected</Badge>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Admin Access Status
        </CardTitle>
        <CardDescription>Current wallet admin privileges</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Connected Wallet:</p>
          <p className="text-sm text-muted-foreground font-mono">{walletAddress}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Admin Status:</p>
          {isAdmin ? (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Admin Access Granted
            </Badge>
          ) : (
            <Badge variant="destructive" className="flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              No Admin Access
            </Badge>
          )}
        </div>

        {isAdmin && (
          <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200">
              🎉 Welcome, admin! You have full administrative access to the auction platform.
            </p>
          </div>
        )}

        {!isAdmin && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              ⚠️ This wallet does not have admin privileges. Only registered admin wallets can access admin features.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
