import { AdminLayout } from "@/components/admin-layout"
import { ChatManagement } from "@/components/chat-management"

export default function AdminChatPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Chat Management</h1>
          <p className="text-muted-foreground">
            View and manage chat messages across the platform. Messages are organized by date.
          </p>
        </div>
        <ChatManagement />
      </div>
    </AdminLayout>
  )
}
