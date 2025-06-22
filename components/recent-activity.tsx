"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

export function RecentActivity() {
  // Mock data - in a real app, this would come from your API/database
  const activities = [
    {
      id: "1",
      type: "bid",
      user: "0x1234...5678",
      action: "placed a bid of 2.5 ETH",
      artwork: "Digital Dreamscape",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
    },
    {
      id: "2",
      type: "sale",
      user: "0x8765...4321",
      action: "won auction for 3.2 ETH",
      artwork: "Pixel Paradise",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "3",
      type: "listing",
      user: "Digital Visionary",
      action: "listed new artwork",
      artwork: "Ethereal Dimensions",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      id: "4",
      type: "bid",
      user: "0x5432...8765",
      action: "placed a bid of 1.8 ETH",
      artwork: "Blockchain Bliss",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "bid":
        return "🔨"
      case "sale":
        return "✅"
      case "listing":
        return "🎨"
      default:
        return "📝"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions on your platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getActivityIcon(activity.type)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span> {activity.action} on{" "}
                  <span className="font-medium">{activity.artwork}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
