'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingCart, List, Package, User, ShieldCheck, LogOut, Waves } from "lucide-react"
import { CartIcon } from "@/components/cart/cart-icon"
import { signOut } from "next-auth/react"

const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Übersicht" },
    { href: "/dashboard/leads", icon: ShoppingCart, label: "Leads kaufen" },
    { href: "/dashboard/my-leads", icon: List, label: "Meine Leads" },
    { href: "/dashboard/cart", icon: Package, label: "Warenkorb" },
    { href: "/dashboard/orders", icon: Package, label: "Bestellungen" },
    { href: "/dashboard/profile", icon: User, label: "Profil" },
]

export function DashboardNav({ userName, userEmail, isAdmin }: {
    userName?: string | null
    userEmail?: string | null
    isAdmin?: boolean
}) {
    const pathname = usePathname()

    return (
        <>
            {/* Sidebar */}
            <aside className="hidden md:flex w-60 flex-col h-screen sticky top-0 overflow-hidden"
                style={{ background: '#1B1B2E' }}>

                {/* Logo */}
                <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #7B2FBE, #9B59D8)' }}>
                        <Waves className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold text-white text-base tracking-tight">PoolLeads</span>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {navItems.map(({ href, icon: Icon, label }) => {
                        const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${isActive
                                        ? 'text-white'
                                        : 'text-white/60 hover:text-white hover:bg-white/8'
                                    }`}
                                style={isActive ? {
                                    background: 'linear-gradient(135deg, rgba(123,47,190,0.9), rgba(123,47,190,0.7))',
                                    boxShadow: '0 2px 8px rgba(123,47,190,0.4)'
                                } : {}}
                            >
                                <Icon className={`h-4 w-4 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`} />
                                {label}
                            </Link>
                        )
                    })}

                    {isAdmin && (
                        <div className="pt-2 mt-2 border-t border-white/10">
                            <Link
                                href="/admin"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-400/90 hover:text-amber-300 hover:bg-amber-400/10 transition-all"
                            >
                                <ShieldCheck className="h-4 w-4" />
                                Admin Panel
                            </Link>
                        </div>
                    )}
                </nav>

                {/* User Footer */}
                <div className="px-3 py-3 border-t border-white/10">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #7B2FBE, #9B4DDB)' }}>
                            {userName?.charAt(0).toUpperCase() || userEmail?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{userName || 'Unbekannt'}</p>
                            <p className="text-xs text-white/40 truncate">{userEmail}</p>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="text-white/40 hover:text-white transition-colors p-1 rounded"
                            title="Abmelden"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}
