"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, Gavel, DollarSign, ImageIcon } from "lucide-react"

export function DashboardStats() {
  // Mock data - in a real app, this would come from your API/database
  const stats = [
    {
      title: "Total Bids",
      value: "1,247",
      change: "+12.5%",
      trend: "up",
      icon: Gavel,
    },
    {
      title: "Total Sales Volume",
      value: "156.8 ETH",
      change: "+8.2%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Active Artists",
      value: "23",
      change: "+2",
      trend: "up",
      icon: Users,
    },
    {
      title: "Artworks Listed",
      value: "89",
      change: "-3",
      trend: "down",
      icon: ImageIcon,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stat.trend === "up" ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>{stat.change}</span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
