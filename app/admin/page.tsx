import { redirect } from "next/navigation"
import { WalletAdminAuth } from "@/components/wallet-admin-auth"
import { cookies } from "next/headers"

export default async function AdminPage() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get("admin-authenticated")?.value === "true"

  if (!isAuthenticated) {
    return <WalletAdminAuth />
  }

  redirect("/admin/dashboard")
}
