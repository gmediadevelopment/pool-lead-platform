import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CartIcon } from "@/components/cart/cart-icon"
import { DashboardNav } from "@/components/dashboard-nav"

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
        <div className="flex h-screen overflow-hidden" style={{ background: '#F4F5F7' }}>
            <DashboardNav
                userName={session.user?.name}
                userEmail={session.user?.email}
                isAdmin={session.user?.role === 'ADMIN'}
            />

            {/* Main area */}
            <div className="flex flex-1 flex-col overflow-hidden min-w-0">
                {/* Topbar */}
                <header className="flex h-14 items-center gap-4 border-b bg-white px-6 flex-shrink-0"
                    style={{ borderColor: '#E8E9EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-500">
                            Willkommen zurück, <span className="font-semibold text-gray-800">{session.user?.name || session.user?.email}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <CartIcon />
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
