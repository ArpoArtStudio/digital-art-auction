import { AdminLayout } from "@/components/admin-layout"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"

export default function AdminAnalytics() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Detailed insights into your auction platform</p>
        </div>
        <AnalyticsDashboard />
      </div>
    </AdminLayout>
  )
}
