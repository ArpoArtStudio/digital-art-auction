"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { formatDistanceToNow } from "date-fns"

export function UsernameChangeRequests() {
  const { pendingUsernameRequests, approveUsernameChange, rejectUsernameChange, isAdmin } = useWallet()

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Username Change Requests</CardTitle>
          <CardDescription>
            You need admin privileges to view this section
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center text-muted-foreground">
            Please connect with an admin wallet to review username change requests
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Username Change Requests</CardTitle>
        <CardDescription>
          Review and manage pending username change requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingUsernameRequests.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No pending username change requests
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsernameRequests.map((request) => (
              <div 
                key={`${request.walletAddress}-${request.requestedAt}`}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="text-sm font-medium flex items-center">
                    {request.walletAddress.substring(0, 6)}...{request.walletAddress.substring(request.walletAddress.length - 4)}
                    <Badge variant="outline" className="ml-2 text-xs">
                      {formatDistanceToNow(request.requestedAt, { addSuffix: true })}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Current name: <span className="font-medium">{request.currentName}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Requested change: <span className="font-medium">{request.requestedName || "Display option change"}</span>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 w-8 p-0" 
                      onClick={() => approveUsernameChange(request.walletAddress)}
                      title="Approve request"
                    >
                      <Check className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 w-8 p-0"
                      onClick={() => rejectUsernameChange(request.walletAddress)}
                      title="Reject request"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    {request.approved ? 'Approved' : 'Pending'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
