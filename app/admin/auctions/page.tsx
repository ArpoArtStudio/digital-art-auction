import { AdminLayout } from "@/components/admin-layout"
import { AuctionManagement } from "@/components/auction-management"

export default function AdminAuctions() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Auction Management</h1>
          <p className="text-muted-foreground">Manage active and past auctions</p>
        </div>
        <AuctionManagement />
      </div>
    </AdminLayout>
  )
}
