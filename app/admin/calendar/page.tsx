import { AdminAuth } from "@/components/admin-auth"
import { AdminLayout } from "@/components/admin-layout"
import { DatabaseCalendar } from "@/components/database-calendar"
import { LargeCalendar } from "@/components/large-calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CalendarPage() {
  return (
    <AdminAuth>
      <AdminLayout>
        {/* Full-screen calendar section */}
        <div className="min-h-screen -m-6 p-6 bg-gray-50">
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h1 className="text-4xl font-bold mb-2">Auction Scheduling Calendar</h1>
              <p className="text-lg text-muted-foreground">
                Manage auction schedules with database integration and smart conflict resolution
              </p>
            </div>

            {/* Calendar tabs */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Tabs defaultValue="database" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="database">Database Calendar</TabsTrigger>
                  <TabsTrigger value="legacy">Legacy Calendar</TabsTrigger>
                </TabsList>
                
                <TabsContent value="database" className="mt-6">
                  <DatabaseCalendar />
                </TabsContent>
                
                <TabsContent value="legacy" className="mt-6">
                  <LargeCalendar />
                </TabsContent>
              </Tabs>
            </div>
        </div>
      </div>
      </AdminLayout>
    </AdminAuth>
  )
}
