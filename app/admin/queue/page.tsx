import { AdminLayout } from "@/components/admin-layout"
import { QueueManagement } from "@/components/queue-management"

export default function AdminQueue() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Auction Queue</h1>
          <p className="text-muted-foreground">Manage submitted artworks and auction queue</p>
        </div>
        <QueueManagement />
      </div>
    </AdminLayout>
  )
}
