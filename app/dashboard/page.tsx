import { Card, CardContent } from "@/components/ui/card"
import { Users, ShoppingCart, TrendingUp, Zap, ArrowRight } from "lucide-react"
import { db } from "@/lib/db"
import Link from "next/link"

export default async function DashboardPage() {
    const availableLeads = await db.countAvailableLeads()
    const purchasedLeads = await db.countPurchasedLeadsThisMonth()

    const stats = [
        {
            label: "Verfügbare Leads",
            value: availableLeads,
            sub: "Jetzt im Marktplatz",
            icon: Users,
            color: "#7B2FBE",
            bg: "rgba(123,47,190,0.08)",
        },
        {
            label: "Gekaufte Leads",
            value: purchasedLeads,
            sub: "Insgesamt erworben",
            icon: ShoppingCart,
            color: "#059669",
            bg: "rgba(5,150,105,0.08)",
        },
        {
            label: "Markt-Aktivität",
            value: availableLeads > 5 ? "Hoch" : "Normal",
            sub: `${availableLeads} Leads verfügbar`,
            icon: TrendingUp,
            color: "#0284C7",
            bg: "rgba(2,132,199,0.08)",
        },
        {
            label: "Status",
            value: "Aktiv",
            sub: "Account bereit",
            icon: Zap,
            color: "#D97706",
            bg: "rgba(217,119,6,0.08)",
        },
    ]

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Welcome Banner */}
            <div className="rounded-xl p-6 text-white overflow-hidden relative"
                style={{
                    background: 'linear-gradient(135deg, #1B1B2E 0%, #2D1B6E 50%, #7B2FBE 100%)',
                }}>
                <div className="absolute top-0 right-0 w-64 h-64 opacity-10"
                    style={{
                        background: 'radial-gradient(circle, white 0%, transparent 70%)',
                        transform: 'translate(30%, -30%)'
                    }} />
                <h1 className="text-2xl font-bold mb-1">Willkommen im Pool Lead Marktplatz</h1>
                <p className="text-white/70 text-sm mb-4">Kaufen Sie qualifizierte Leads direkt von Pool-Interessenten.</p>
                <Link href="/dashboard/leads"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-purple-900 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors">
                    Leads entdecken
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {stats.map(({ label, value, sub, icon: Icon, color, bg }) => (
                    <Card key={label} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-medium text-gray-500">{label}</p>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                                    <Icon className="h-4 w-4" style={{ color }} />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-gray-800 mb-0.5">{value}</div>
                            <p className="text-xs text-gray-400">{sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Schnellzugriff</h2>
                <div className="grid gap-3 sm:grid-cols-3">
                    {[
                        { href: "/dashboard/leads", label: "Leads kaufen", desc: "Neue Leads im Marktplatz ansehen", icon: ShoppingCart, color: "#7B2FBE" },
                        { href: "/dashboard/my-leads", label: "Meine Leads", desc: "Deine erworbenen Leads anzeigen", icon: Users, color: "#059669" },
                        { href: "/dashboard/orders", label: "Bestellungen", desc: "Deine Kaufhistorie verwalten", icon: TrendingUp, color: "#0284C7" },
                    ].map(({ href, label, desc, icon: Icon, color }) => (
                        <Link key={href} href={href}>
                            <Card className="border-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                            style={{ background: `${color}15` }}>
                                            <Icon className="h-4 w-4" style={{ color }} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">{label}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-purple-500 transition-colors mt-1 flex-shrink-0" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
