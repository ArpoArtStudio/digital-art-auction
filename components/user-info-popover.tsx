"use client"

import React from "react"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { useBiddingContext, BiddingLevel } from "@/contexts/bidding-context"
import { User, Award } from "lucide-react"
import { format } from "date-fns"

interface UserInfoPopoverProps {
  walletAddress: string
  displayName: string
  isAdmin: boolean
  level?: BiddingLevel
  bidCount?: number
  firstSeen?: string
  children: React.ReactNode
}

export function UserInfoPopover({
  walletAddress,
  displayName,
  isAdmin,
  level = BiddingLevel.Newcomer,
  bidCount = 0,
  firstSeen,
  children,
}: UserInfoPopoverProps) {
  const { getLevelColor, getLevelName, getLevelBadge } = useBiddingContext()
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${isAdmin ? "bg-red-400/10" : getLevelColor(level).replace('text-', 'bg-').replace('-400', '-400/10')}`}>
              {isAdmin ? (
                <Award className="h-6 w-6 text-red-400" />
              ) : (
                <User className={`h-6 w-6 ${getLevelColor(level)}`} />
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold">{displayName}</h3>
                <Badge 
                  variant="outline" 
                  className={`text-xs h-4 border-0 ${isAdmin ? 'bg-red-400/10 text-red-400' : getLevelColor(level).replace('text-', 'bg-').replace('-400', '-400/10')}`}
                >
                  {isAdmin ? 'Admin' : getLevelBadge(level)}
                </Badge>
              </div>
              
              <p className="text-xs text-muted-foreground break-all">{walletAddress}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Status</p>
              <p className="font-medium">
                {isAdmin ? "Admin" : getLevelName(level)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Bids Placed</p>
              <p className="font-medium">{bidCount}</p>
            </div>
            {firstSeen && (
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs">First seen</p>
                <p className="font-medium">{format(new Date(firstSeen), "MMM d, yyyy")}</p>
              </div>
            )}
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">
              {isAdmin 
                ? "This user is an administrator of the auction platform." 
                : `This user has placed ${bidCount} bid${bidCount !== 1 ? 's' : ''} and is currently a ${getLevelName(level)}.`
              }
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
