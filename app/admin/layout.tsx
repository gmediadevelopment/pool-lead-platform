import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminNav } from "@/components/admin-nav"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        redirect("/login")
    }

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: '#F4F5F7' }}>
            <AdminNav />

            {/* Main content */}
            <div className="flex flex-1 flex-col overflow-hidden min-w-0">
                {/* Topbar */}
                <header className="flex h-14 items-center gap-4 border-b bg-white px-6 flex-shrink-0"
                    style={{ borderColor: '#E8E9EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-500">
                            Eingeloggt als <span className="font-semibold text-gray-800">{session.user?.email}</span>
                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded font-medium">Admin</span>
                        </p>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
