import { AdminLayout } from "@/components/admin-layout"
import { EnhancedDashboardStats } from "@/components/enhanced-dashboard-stats"
import { RecentActivity } from "@/components/recent-activity"
import { AuctionChart } from "@/components/auction-chart"
import { AdminWalletInfo } from "@/components/admin-wallet-info"
import { UsernameManagement } from "@/components/username-management"
import { CustomScheduleManagement } from "@/components/custom-schedule-management"
import { AdminCalendar } from "@/components/admin-calendar"
import { EnhancedQueueManagement } from "@/components/enhanced-queue-management"

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

        <UsernameManagement />

        <CustomScheduleManagement />

        <EnhancedQueueManagement />

        <AdminCalendar />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AuctionChart />
          <RecentActivity />
        </div>
      </div>
    </AdminLayout>
  )
}
