import { AdminLayout } from "@/components/admin-layout"
import { EnhancedDashboardStats } from "@/components/enhanced-dashboard-stats"
import { RecentActivity } from "@/components/recent-activity"
import { AuctionChart } from "@/components/auction-chart"
import { AdminWalletInfo } from "@/components/admin-wallet-info"

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your auction platform</p>
        </div>

        <AdminWalletInfo />

        <EnhancedDashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AuctionChart />
          <RecentActivity />
        </div>
      </div>
    </AdminLayout>
  )
}
