import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Users, FileText } from "lucide-react"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions)

    // Basic role check - ensures middleware didn't miss it or for direct access
    if (!session || session.user.role !== "ADMIN") {
        redirect("/login")
    }

    return (
        <div className="flex min-h-screen">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <Link href="/admin" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded transition-colors">
                        <FileText className="h-5 w-5" />
                        Leads verwalten
                    </Link>
                    <Link href="/admin/users" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded transition-colors">
                        <Users className="h-5 w-5" />
                        Firmen / User
                    </Link>
                    <Link href="/dashboard" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded transition-colors mt-auto text-slate-400 hover:text-white">
                        <LayoutDashboard className="h-5 w-5" />
                        Zurück zur App
                    </Link>
                </nav>
            </aside>
            <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
