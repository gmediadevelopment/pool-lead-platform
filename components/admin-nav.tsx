'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, FileText, ShoppingBag, ChevronLeft, Waves, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

const adminNavItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Übersicht", exact: true },
    { href: "/admin/leads", icon: FileText, label: "Leads verwalten" },
    { href: "/admin/sold-leads", icon: ShoppingBag, label: "Verkaufte Leads" },
    { href: "/admin/users", icon: Users, label: "Firmen / User" },
]

export function AdminNav() {
    const pathname = usePathname()

    return (
        <aside className="hidden md:flex w-60 flex-col h-screen sticky top-0 overflow-hidden"
            style={{ background: '#1B1B2E' }}>

            {/* Logo + Admin Badge */}
            <div className="px-5 py-5 border-b border-white/10">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #7B2FBE, #9B59D8)' }}>
                        <Waves className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold text-white text-base tracking-tight">PoolLeads</span>
                </div>
                <div className="px-2 py-1 rounded-md text-xs font-semibold text-amber-300 bg-amber-400/15 inline-block">
                    Admin Panel
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {adminNavItems.map(({ href, icon: Icon, label, exact }) => {
                    const isActive = exact ? pathname === href : pathname.startsWith(href)
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

                <div className="pt-2 mt-2 border-t border-white/10">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/8 transition-all"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Zurück zur App
                    </Link>
                </div>
            </nav>

            {/* Logout Footer */}
            <div className="px-3 py-3 border-t border-white/10">
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-white hover:bg-white/8 transition-all"
                >
                    <LogOut className="h-4 w-4" />
                    Abmelden
                </button>
            </div>
        </aside>
    )
}
