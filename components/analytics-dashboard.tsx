"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, PieChart, Pie, Cell } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const revenueData = [
  { month: "Jan", revenue: 12.5, bids: 45 },
  { month: "Feb", revenue: 18.2, bids: 52 },
  { month: "Mar", revenue: 15.8, bids: 48 },
  { month: "Apr", revenue: 22.1, bids: 61 },
  { month: "May", revenue: 19.5, bids: 55 },
  { month: "Jun", revenue: 28.3, bids: 67 },
]

const categoryData = [
  { name: "Digital Art", value: 45, color: "hsl(var(--chart-1))" },
  { name: "Photography", value: 25, color: "hsl(var(--chart-2))" },
  { name: "3D Models", value: 20, color: "hsl(var(--chart-3))" },
  { name: "Animation", value: 10, color: "hsl(var(--chart-4))" },
]

const topArtists = [
  { name: "Digital Visionary", sales: "45.5 ETH", artworks: 12 },
  { name: "Pixel Prophet", sales: "32.2 ETH", artworks: 8 },
  { name: "Crypto Canvas", sales: "28.8 ETH", artworks: 15 },
  { name: "NFT Nomad", sales: "18.3 ETH", artworks: 6 },
]

export function AnalyticsDashboard() {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="revenue">Revenue</TabsTrigger>
        <TabsTrigger value="artists">Artists</TabsTrigger>
        <TabsTrigger value="categories">Categories</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156.8 ETH</div>
              <p className="text-xs text-muted-foreground">+12.5% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">+8.2% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg. Sale Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.3 ETH</div>
              <p className="text-xs text-muted-foreground">+5.1% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">+2.3% from last month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue (ETH)",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
              <CardDescription>Breakdown of artworks by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: {
                    label: "Percentage",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="revenue" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
            <CardDescription>Detailed revenue breakdown and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue (ETH)",
                  color: "hsl(var(--chart-1))",
                },
                bids: {
                  label: "Total Bids",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[400px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                  />
                  <Line yAxisId="right" type="monotone" dataKey="bids" stroke="var(--color-bids)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="artists" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Artists</CardTitle>
            <CardDescription>Artists ranked by total sales volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topArtists.map((artist, index) => (
                <div key={artist.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold">{artist.name}</h3>
                      <p className="text-sm text-muted-foreground">{artist.artworks} artworks</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{artist.sales}</div>
                    <div className="text-sm text-muted-foreground">Total sales</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="categories" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>Sales distribution by artwork category</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: {
                    label: "Percentage",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
              <CardDescription>Detailed breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryData.map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{category.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}
