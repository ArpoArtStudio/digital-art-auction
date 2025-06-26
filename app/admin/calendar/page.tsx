import { AdminLayout } from "@/components/admin-layout"
import { LargeCalendar } from "@/components/large-calendar"

export default function CalendarPage() {
  return (
    <AdminLayout>
      {/* Full-screen calendar section */}
      <div className="min-h-screen -m-6 p-6 bg-gray-50">
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-4xl font-bold mb-2">Auction Scheduling Calendar</h1>
            <p className="text-lg text-muted-foreground">
              Large view calendar for managing auction schedules with smart conflict resolution and custom interruption handling
            </p>
          </div>

          {/* Large calendar takes full available space */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <LargeCalendar />
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
