import Link from "next/link"
import { ShieldCheck, LayoutDashboard, ShoppingCart, User, List } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="hidden w-64 overflow-y-auto border-r bg-white dark:bg-gray-950 md:block">
                <div className="flex h-14 items-center border-b px-4">
                    <Link className="flex items-center gap-2 font-semibold" href="/">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        <span>PoolLeads</span>
                    </Link>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800"
                        href="/dashboard"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                    </Link>
                    <Link
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800"
                        href="/dashboard/leads"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        Leads kaufen
                    </Link>
                    <Link
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800"
                        href="/dashboard/my-leads"
                    >
                        <List className="h-4 w-4" />
                        Meine Leads
                    </Link>
                    <Link
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800"
                        href="/dashboard/profile"
                    >
                        <User className="h-4 w-4" />
                        Profil
                    </Link>
                    {session.user?.role === "ADMIN" && (
                        <Link
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-red-500 transition-all hover:text-red-900 dark:text-red-400 dark:hover:text-red-50 hover:bg-red-50 dark:hover:bg-red-950"
                            href="/admin"
                        >
                            <ShieldCheck className="h-4 w-4" />
                            Admin
                        </Link>
                    )}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-14 items-center gap-4 border-b bg-white dark:bg-gray-950 px-6">
                    <div className="flex-1">
                        <h1 className="font-semibold text-lg">Willkommen, {session.user?.name}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">{session.user?.email}</span>
                        {/* UserMenu could go here */}
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
