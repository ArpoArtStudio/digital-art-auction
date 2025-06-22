import { AdminLayout } from "@/components/admin-layout"
import { SettingsPanel } from "@/components/settings-panel"

export default function AdminSettings() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your platform settings</p>
        </div>
        <SettingsPanel />
      </div>
    </AdminLayout>
  )
}
