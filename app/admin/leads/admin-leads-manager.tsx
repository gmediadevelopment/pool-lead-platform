'use client'

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, ArrowLeft, SlidersHorizontal, X, Star, CheckCircle2 } from "lucide-react"
import { deleteLeadAction, unpublishLeadAction } from "./actions"

// ---------------------------------------------------------------------------
// Types & Constants (same as marketplace)
// ---------------------------------------------------------------------------

interface Lead {
    id: string
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    zip?: string
    city?: string
    poolType?: string
    type?: string
    status?: string
    price?: any
    dimensions?: string
    features?: string
    estimatedPrice?: any
    estimatedPriceMin?: any
    estimatedPriceMax?: any
    timeline?: string
    budgetConfirmed?: any
    createdAt?: any
}

const POOL_TYPES = ["GFK-Fertigbecken", "Beton / Gunite", "Folienbecken", "Naturpool", "Aufstellpool", "Stahlwandbecken"]
const TIMELINES = ["asap", "3 Monate", "6 Monate", "1 Jahr", "2+ Jahre"]
const BUDGET_RANGES = [
    { label: "Bis 20.000€", min: 0, max: 20000 },
    { label: "20.000 – 50.000€", min: 20000, max: 50000 },
    { label: "50.000 – 100.000€", min: 50000, max: 100000 },
    { label: "Über 100.000€", min: 100000, max: Infinity },
]

function getEffectiveType(lead: Lead) {
    return lead.type === 'CONSULTATION' ? 'CONSULTATION' : 'INTEREST'
}

function toggle<T>(arr: T[], val: T, set: (v: T[]) => void) {
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
}

// ---------------------------------------------------------------------------
// FilterSidebar
// ---------------------------------------------------------------------------

interface FilterSidebarProps {
    sortBy: string
    setSortBy: (v: "price_asc" | "price_desc" | "newest") => void
    filterZip: string
    setFilterZip: (v: string) => void
    filterType: string[]
    setFilterType: (v: string[]) => void
    filterPoolType: string[]
    setFilterPoolType: (v: string[]) => void
    filterBudget: number | null
    setFilterBudget: (v: number | null) => void
    filterTimeline: string[]
    setFilterTimeline: (v: string[]) => void
}

function FilterSidebar({
    sortBy, setSortBy,
    filterZip, setFilterZip,
    filterType, setFilterType,
    filterPoolType, setFilterPoolType,
    filterBudget, setFilterBudget,
    filterTimeline, setFilterTimeline,
}: FilterSidebarProps) {
    return (
        <div className="space-y-5">
            {/* Sortierung */}
            <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sortierung</h3>
                <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                    <option value="newest">Neueste zuerst</option>
                    <option value="price_asc">Preis aufsteigend</option>
                    <option value="price_desc">Preis absteigend</option>
                </select>
            </div>

            {/* PLZ */}
            <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">PLZ / Region</h3>
                <input
                    type="text"
                    placeholder="z.B. 78 oder 40..."
                    value={filterZip}
                    onChange={e => setFilterZip(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    maxLength={5}
                />
            </div>

            {/* Lead-Typ */}
            <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Lead-Typ</h3>
                <div className="space-y-2">
                    {[
                        { value: "CONSULTATION", label: "Beratung angefragt", icon: Star },
                        { value: "INTEREST", label: "Interesse", icon: CheckCircle2 },
                    ].map(({ value, label, icon: Icon }) => {
                        const active = filterType.includes(value)
                        return (
                            <label key={value} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${active ? 'bg-blue-50 border-blue-200' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input type="checkbox" className="sr-only" checked={active} onChange={() => toggle(filterType, value, setFilterType)} />
                                <Icon className={`h-4 w-4 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                                <span className={`text-sm font-medium ${active ? 'text-blue-700' : 'text-gray-600'}`}>{label}</span>
                            </label>
                        )
                    })}
                </div>
            </div>

            {/* Pool-Typ */}
            <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pool-Typ</h3>
                <div className="space-y-1.5">
                    {POOL_TYPES.map(type => {
                        const active = filterPoolType.includes(type)
                        return (
                            <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${active ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'}`}>
                                    {active && <X className="h-2.5 w-2.5 text-white" />}
                                </div>
                                <input type="checkbox" className="sr-only" checked={active} onChange={() => toggle(filterPoolType, type, setFilterPoolType)} />
                                <span className={`text-sm transition-colors ${active ? 'text-blue-700 font-medium' : 'text-gray-600 group-hover:text-gray-800'}`}>{type}</span>
                            </label>
                        )
                    })}
                </div>
            </div>

            {/* Budget */}
            <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Budget-Bereich</h3>
                <div className="space-y-1.5">
                    {BUDGET_RANGES.map((range, i) => {
                        const active = filterBudget === i
                        return (
                            <label key={i} className="flex items-center gap-2.5 cursor-pointer group">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${active ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'}`}>
                                    {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                                <input type="radio" className="sr-only" checked={active} onChange={() => setFilterBudget(active ? null : i)} />
                                <span className={`text-sm transition-colors ${active ? 'text-blue-700 font-medium' : 'text-gray-600 group-hover:text-gray-800'}`}>{range.label}</span>
                            </label>
                        )
                    })}
                </div>
            </div>

            {/* Realisierung */}
            <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Realisierung</h3>
                <div className="flex flex-wrap gap-1.5">
                    {TIMELINES.map(t => {
                        const active = filterTimeline.includes(t)
                        return (
                            <button key={t}
                                onClick={() => toggle(filterTimeline, t, setFilterTimeline)}
                                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${active ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600'}`}
                            >{t}</button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function AdminLeadsManager({ leads }: { leads: Lead[] }) {
    const [filterType, setFilterType] = useState<string[]>([])
    const [filterPoolType, setFilterPoolType] = useState<string[]>([])
    const [filterTimeline, setFilterTimeline] = useState<string[]>([])
    const [filterBudget, setFilterBudget] = useState<number | null>(null)
    const [filterZip, setFilterZip] = useState("")
    const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "newest">("newest")
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

    const filtered = useMemo(() => {
        let result = [...leads]
        if (filterType.length > 0) result = result.filter(l => filterType.includes(getEffectiveType(l)))
        if (filterPoolType.length > 0) result = result.filter(l => filterPoolType.includes(l.poolType || ""))
        if (filterTimeline.length > 0) result = result.filter(l => l.timeline && filterTimeline.some(t => l.timeline!.toLowerCase().includes(t.toLowerCase())))
        if (filterBudget !== null) {
            const range = BUDGET_RANGES[filterBudget]
            result = result.filter(l => {
                const mid = Number(l.estimatedPrice || l.estimatedPriceMin || 0)
                return mid >= range.min && mid <= range.max
            })
        }
        if (filterZip.trim()) result = result.filter(l => l.zip?.startsWith(filterZip.trim()))
        result.sort((a, b) => {
            if (sortBy === "price_asc") return Number(a.price) - Number(b.price)
            if (sortBy === "price_desc") return Number(b.price) - Number(a.price)
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        })
        return result
    }, [leads, filterType, filterPoolType, filterTimeline, filterBudget, filterZip, sortBy])

    const activeFilterCount = filterType.length + filterPoolType.length + filterTimeline.length + (filterBudget !== null ? 1 : 0) + (filterZip ? 1 : 0)

    function clearAll() {
        setFilterType([]); setFilterPoolType([]); setFilterTimeline([]); setFilterBudget(null); setFilterZip("")
    }

    const sidebarProps: FilterSidebarProps = {
        sortBy, setSortBy,
        filterZip, setFilterZip,
        filterType, setFilterType,
        filterPoolType, setFilterPoolType,
        filterBudget, setFilterBudget,
        filterTimeline, setFilterTimeline,
    }

    if (leads.length === 0) {
        return (
            <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                    Keine freigegebenen Leads vorhanden.
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="flex gap-6">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-semibold text-gray-800">Filter</span>
                            {activeFilterCount > 0 && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full text-white font-bold" style={{ background: '#1E88D9' }}>
                                    {activeFilterCount}
                                </span>
                            )}
                        </div>
                        {activeFilterCount > 0 && (
                            <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
                                Alle löschen
                            </button>
                        )}
                    </div>
                    <FilterSidebar {...sidebarProps} />
                </div>
            </aside>

            {/* Mobile Filter Button */}
            <div className="lg:hidden w-full">
                <button
                    onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 mb-4"
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filter
                    {activeFilterCount > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-600 text-white font-bold">{activeFilterCount}</span>
                    )}
                </button>
                {mobileFiltersOpen && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                        <FilterSidebar {...sidebarProps} />
                    </div>
                )}
            </div>

            {/* Lead Cards */}
            <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-4">
                    {filtered.length} von {leads.length} Leads
                </p>

                {filtered.length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-center text-muted-foreground">
                            Keine Leads für diese Filterauswahl.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {filtered.map((lead) => {
                            const isConsultation = getEffectiveType(lead) === 'CONSULTATION'
                            return (
                                <Card key={lead.id} className={isConsultation ? 'border-blue-200' : ''}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <CardTitle>{lead.firstName} {lead.lastName}</CardTitle>
                                                    {isConsultation ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                            <Star className="h-3 w-3 fill-blue-500 text-blue-500" />
                                                            Beratung angefragt
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                                            Interessent
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">{lead.zip} {lead.city}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Badge variant="outline">{lead.poolType}</Badge>
                                                {lead.price && (
                                                    <Badge className={isConsultation ? "bg-purple-600" : "bg-blue-600"}>
                                                        {Math.round(Number(lead.price))}€
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                            <div>
                                                <p className="font-semibold">Kontakt</p>
                                                <p>{lead.email}</p>
                                                <p>{lead.phone || "Kein Telefon"}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold">Details</p>
                                                <p>{lead.dimensions}</p>
                                                <p>{lead.features || "-"}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold">Budget</p>
                                                {lead.estimatedPriceMin && lead.estimatedPriceMax ? (
                                                    lead.estimatedPriceMin === lead.estimatedPriceMax ? (
                                                        <p>{Number(lead.estimatedPriceMin).toLocaleString()} €</p>
                                                    ) : (
                                                        <p>{Number(lead.estimatedPriceMin).toLocaleString()} € – {Number(lead.estimatedPriceMax).toLocaleString()} €</p>
                                                    )
                                                ) : (
                                                    <p>Keine Angabe</p>
                                                )}
                                            </div>
                                            {(lead.timeline || Boolean(lead.budgetConfirmed)) && (
                                                <div>
                                                    <p className="font-semibold">Beratung</p>
                                                    {lead.timeline && lead.timeline !== '' && <p>Bauzeitraum: {lead.timeline}</p>}
                                                    {Boolean(lead.budgetConfirmed) && <p className="text-green-600">✓ Budget bestätigt</p>}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-end gap-2 pt-4 border-t">
                                            <form action={unpublishLeadAction.bind(null, lead.id)}>
                                                <Button variant="outline" size="sm" type="submit">
                                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                                    Zurückziehen
                                                </Button>
                                            </form>
                                            <form action={deleteLeadAction.bind(null, lead.id)}>
                                                <Button variant="destructive" size="sm" type="submit">
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Löschen
                                                </Button>
                                            </form>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
