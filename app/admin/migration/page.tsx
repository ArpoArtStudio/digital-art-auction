import { AdminAuth } from "@/components/admin-auth"
import { AdminLayout } from "@/components/admin-layout"
import { DatabaseMigration } from "@/components/database-migration"

export default function AdminMigrationPage() {
  return (
    <AdminAuth>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Database Migration</h1>
            <p className="text-muted-foreground">
              Migrate your data from localStorage to Supabase database
            </p>
          </div>
          <DatabaseMigration />
        </div>
      </AdminLayout>
    </AdminAuth>
  )
}
