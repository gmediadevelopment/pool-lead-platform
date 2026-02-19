'use client'

import { useState, useMemo } from "react"
import { AddToCartButton } from "@/components/cart/add-to-cart-button"
import { BuyNowButton } from "@/components/cart/buy-now-button"
import {
    MapPin, Ruler, Waves, SlidersHorizontal, X,
    Star, CheckCircle2, Clock, Euro
} from "lucide-react"

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------

interface Lead {
    id: string
    poolType?: string
    type?: string
    status?: string
    price?: any
    zip?: string
    city?: string
    dimensions?: string
    features?: string
    estimatedPrice?: any
    estimatedPriceMin?: any
    estimatedPriceMax?: any
    timeline?: string
    budgetConfirmed?: boolean
    createdAt?: string
}

interface Props {
    leads: Lead[]
    purchasedLeadIds: string[]
    cartLeadIds: string[]
}

const POOL_TYPES = ["GFK-Fertigbecken", "Beton / Gunite", "Folienbecken", "Naturpool", "Aufstellpool", "Stahlwandbecken"]
const TIMELINES = ["asap", "3 Monate", "6 Monate", "1 Jahr", "2+ Jahre"]
const BUDGET_RANGES = [
    { label: "Bis 20.000€", min: 0, max: 20000 },
    { label: "20.000 – 50.000€", min: 20000, max: 50000 },
    { label: "50.000 – 100.000€", min: 50000, max: 100000 },
    { label: "Über 100.000€", min: 100000, max: Infinity },
]

// Lead type is ONLY determined by the 'type' field (INTEREST=49€ / CONSULTATION=99€)
// Price is a RESULT of type, never used to determine type
function getEffectiveType(lead: Lead) {
    return lead.type === 'CONSULTATION' ? 'CONSULTATION' : 'INTEREST'
}

function toggle<T>(arr: T[], val: T, set: (v: T[]) => void) {
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
}

// ---------------------------------------------------------------------------
// FilterSidebar – defined OUTSIDE LeadsMarketplace so React never remounts it
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

export function LeadsMarketplace({ leads, purchasedLeadIds, cartLeadIds }: Props) {
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

            {/* Main content */}
            <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Leads Marktplatz</h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {filtered.length} von {leads.length} {leads.length === 1 ? 'Lead' : 'Leads'} angezeigt
                        </p>
                    </div>
                    <button
                        onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                        className="lg:hidden flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
                    </button>
                </div>

                {/* Mobile filters */}
                {mobileFiltersOpen && (
                    <div className="lg:hidden bg-white rounded-xl border border-gray-200 p-4 mb-4">
                        <FilterSidebar {...sidebarProps} />
                    </div>
                )}

                {/* Leads grid */}
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <SlidersHorizontal className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">Keine Leads gefunden</p>
                        <p className="text-sm text-gray-400 mt-1">Versuche andere Filter-Einstellungen.</p>
                        {activeFilterCount > 0 && (
                            <button onClick={clearAll} className="mt-3 text-sm text-blue-600 hover:underline">Filter zurücksetzen</button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {filtered.map(lead => {
                            const isPurchased = purchasedLeadIds.includes(lead.id)
                            const isInCart = cartLeadIds.includes(lead.id)
                            const isConsultation = getEffectiveType(lead) === 'CONSULTATION'

                            return (
                                <div key={lead.id} className={`relative rounded-xl border bg-white flex flex-col overflow-hidden transition-shadow hover:shadow-md ${isPurchased ? 'opacity-70' : ''} ${isConsultation ? 'border-blue-200' : 'border-gray-200'}`}>

                                    {/* Consultation top bar */}
                                    {isConsultation && (
                                        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #1E88D9, #5BB5F0)' }} />
                                    )}

                                    <div className="p-4 flex-1 flex flex-col">
                                        {/* Header */}
                                        <div className="flex justify-between items-start mb-3">
                                            {isConsultation ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-blue-700 bg-blue-100">
                                                    <Star className="h-3 w-3 fill-blue-500 text-blue-500" />
                                                    Beratung angefragt
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-gray-600 bg-gray-100">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Interesse
                                                </span>
                                            )}
                                            <span className={`font-bold text-lg ${isConsultation ? 'text-blue-700' : 'text-gray-800'}`}>
                                                {Number(lead.price).toFixed(0)}€
                                            </span>
                                        </div>

                                        {/* Pool type */}
                                        <h3 className="font-bold text-gray-900 text-base mb-1">{lead.poolType}</h3>

                                        {/* Location */}
                                        <div className="flex items-center text-gray-500 text-sm gap-1 mb-3">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {lead.zip} {lead.city}
                                        </div>

                                        {/* Details */}
                                        <div className="flex gap-4 text-sm text-gray-500 mb-3">
                                            {lead.dimensions && (
                                                <div className="flex items-center gap-1.5">
                                                    <Ruler className="h-3.5 w-3.5" />
                                                    <span>{lead.dimensions}</span>
                                                </div>
                                            )}
                                            {lead.features && (
                                                <div className="flex items-center gap-1.5">
                                                    <Waves className="h-3.5 w-3.5" />
                                                    <span>Extras</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Budget / Timeline */}
                                        <div className={`rounded-lg p-3 text-sm space-y-1.5 mb-3 ${isConsultation ? 'bg-blue-50' : 'bg-gray-50'}`}>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500 flex items-center gap-1">
                                                    <Euro className="h-3.5 w-3.5" /> Budget
                                                </span>
                                                <span className="font-semibold text-gray-800">
                                                    {lead.estimatedPriceMin && lead.estimatedPriceMax
                                                        ? `${Number(lead.estimatedPriceMin).toLocaleString()}€ – ${Number(lead.estimatedPriceMax).toLocaleString()}€`
                                                        : lead.estimatedPrice
                                                            ? `${Number(lead.estimatedPrice).toLocaleString()}€`
                                                            : 'Auf Anfrage'
                                                    }
                                                </span>
                                            </div>
                                            {lead.timeline && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500 flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5" /> Realisierung
                                                    </span>
                                                    <span className="font-semibold text-gray-800">{lead.timeline}</span>
                                                </div>
                                            )}
                                            {isConsultation && (
                                                <div className="pt-1 border-t border-blue-100">
                                                    <span className="text-xs text-blue-600 font-medium">✓ Budget bestätigt – hat Beratung angefragt</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Blurred contact */}
                                        <div className="filter blur-[4px] select-none opacity-40 text-sm text-gray-600 flex-1">
                                            <p>Max Mustermann</p>
                                            <p>0171 1234567</p>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className={`px-4 py-3 border-t flex gap-2 ${isConsultation ? 'bg-blue-50/50 border-blue-100' : 'bg-gray-50/50 border-gray-100'}`}>
                                        <AddToCartButton leadId={lead.id} isInCart={isInCart} isPurchased={isPurchased} size="sm" />
                                        {!isPurchased && <BuyNowButton leadId={lead.id} size="sm" />}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
