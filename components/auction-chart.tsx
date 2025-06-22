"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  { month: "Jan", bids: 45, sales: 12 },
  { month: "Feb", bids: 52, sales: 15 },
  { month: "Mar", bids: 48, sales: 11 },
  { month: "Apr", bids: 61, sales: 18 },
  { month: "May", bids: 55, sales: 16 },
  { month: "Jun", bids: 67, sales: 21 },
]

export function AuctionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Auction Activity</CardTitle>
        <CardDescription>Monthly bids and sales over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            bids: {
              label: "Bids",
              color: "hsl(var(--chart-1))",
            },
            sales: {
              label: "Sales",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="bids" fill="var(--color-bids)" />
              <Bar dataKey="sales" fill="var(--color-sales)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
