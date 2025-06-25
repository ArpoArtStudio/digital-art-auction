import { AdminLayout } from "@/components/admin-layout"
import { UsernameChangeRequests } from "@/components/username-change-requests"

export default function AdminUsernamePage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts and username change requests</p>
        </div>
        <UsernameChangeRequests />
      </div>
    </AdminLayout>
  )
}
