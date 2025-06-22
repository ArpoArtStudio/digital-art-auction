import { AdminLayout } from "@/components/admin-layout"
import { ArtistManagement } from "@/components/artist-management"

export default function AdminArtists() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Artist Management</h1>
          <p className="text-muted-foreground">Manage artists and their profiles</p>
        </div>
        <ArtistManagement />
      </div>
    </AdminLayout>
  )
}
