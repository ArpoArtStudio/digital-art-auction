import { AdminLayout } from "@/components/admin-layout"
import { ChatHistory } from "@/components/chat-history"

export default function AdminChatPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Chat Management</h1>
          <p className="text-muted-foreground">
            View and manage chat messages across the platform
          </p>
        </div>
        <ChatHistory />
      </div>
    </AdminLayout>
  )
}
