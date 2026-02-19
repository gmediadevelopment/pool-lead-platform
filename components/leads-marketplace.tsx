'use client'

import { useState, useMemo } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddToCartButton } from "@/components/cart/add-to-cart-button"
import { BuyNowButton } from "@/components/cart/buy-now-button"
import {
    MapPin, Ruler, Waves, SlidersHorizontal, X,
    Star, CheckCircle2, Clock, Tag, Euro
} from "lucide-react"

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

        if (filterType.length > 0) {
            result = result.filter(l => filterType.includes(l.type || "INTEREST"))
        }
        if (filterPoolType.length > 0) {
            result = result.filter(l => filterPoolType.includes(l.poolType || ""))
        }
        if (filterTimeline.length > 0) {
            result = result.filter(l => l.timeline && filterTimeline.some(t =>
                l.timeline?.toLowerCase().includes(t.toLowerCase())
            ))
        }
        if (filterBudget !== null) {
            const range = BUDGET_RANGES[filterBudget]
            result = result.filter(l => {
                const mid = Number(l.estimatedPrice || l.estimatedPriceMin || 0)
                return mid >= range.min && mid <= range.max
            })
        }
        if (filterZip.trim()) {
            result = result.filter(l => l.zip?.startsWith(filterZip.trim()))
        }

        result.sort((a, b) => {
            if (sortBy === "price_asc") return Number(a.price) - Number(b.price)
            if (sortBy === "price_desc") return Number(b.price) - Number(a.price)
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        })

        return result
    }, [leads, filterType, filterPoolType, filterTimeline, filterBudget, filterZip, sortBy])

    const activeFilterCount = filterType.length + filterPoolType.length + filterTimeline.length + (filterBudget !== null ? 1 : 0) + (filterZip ? 1 : 0)

    function clearAll() {
        setFilterType([])
        setFilterPoolType([])
        setFilterTimeline([])
        setFilterBudget(null)
        setFilterZip("")
    }

    function toggle<T>(arr: T[], val: T, set: (v: T[]) => void) {
        set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
    }

    const FilterSidebar = () => (
        <div className="space-y-5">
            {/* Sort */}
            <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sortierung</h3>
                <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                >
                    <option value="newest">Neueste zuerst</option>
                    <option value="price_asc">Preis aufsteigend</option>
                    <option value="price_desc">Preis absteigend</option>
                </select>
            </div>

            {/* PLZ Filter */}
            <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">PLZ / Region</h3>
                <input
                    type="text"
                    placeholder="z.B. 78 oder 40..."
                    value={filterZip}
                    onChange={e => setFilterZip(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    maxLength={5}
                />
            </div>

            {/* Lead Typ */}
            <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Lead-Typ</h3>
                <div className="space-y-2">
                    {[
                        { value: "CONSULTATION", label: "Beratung angefragt", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: Star },
                        { value: "INTEREST", label: "Interesse", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: CheckCircle2 },
                    ].map(({ value, label, color, bg, icon: Icon }) => (
                        <label key={value} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${filterType.includes(value) ? `${bg} border-current` : 'border-gray-200 hover:bg-gray-50'}`}>
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={filterType.includes(value)}
                                onChange={() => toggle(filterType, value, setFilterType)}
                            />
                            <Icon className={`h-4 w-4 ${filterType.includes(value) ? color : 'text-gray-400'}`} />
                            <span className={`text-sm font-medium ${filterType.includes(value) ? color : 'text-gray-600'}`}>{label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Pool-Typ */}
            <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pool-Typ</h3>
                <div className="space-y-1.5">
                    {POOL_TYPES.map(type => (
                        <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${filterPoolType.includes(type) ? 'bg-purple-600 border-purple-600' : 'border-gray-300 group-hover:border-purple-400'}`}>
                                {filterPoolType.includes(type) && <X className="h-2.5 w-2.5 text-white" />}
                            </div>
                            <input type="checkbox" className="sr-only" checked={filterPoolType.includes(type)} onChange={() => toggle(filterPoolType, type, setFilterPoolType)} />
                            <span className={`text-sm transition-colors ${filterPoolType.includes(type) ? 'text-purple-700 font-medium' : 'text-gray-600 group-hover:text-gray-800'}`}>{type}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Budget */}
            <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Budget-Bereich</h3>
                <div className="space-y-1.5">
                    {BUDGET_RANGES.map((range, i) => (
                        <label key={i} className="flex items-center gap-2.5 cursor-pointer group">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${filterBudget === i ? 'bg-purple-600 border-purple-600' : 'border-gray-300 group-hover:border-purple-400'}`}>
                                {filterBudget === i && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <input type="radio" className="sr-only" checked={filterBudget === i} onChange={() => setFilterBudget(filterBudget === i ? null : i)} />
                            <span className={`text-sm transition-colors ${filterBudget === i ? 'text-purple-700 font-medium' : 'text-gray-600 group-hover:text-gray-800'}`}>{range.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Realisierung */}
            <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Realisierung</h3>
                <div className="flex flex-wrap gap-1.5">
                    {TIMELINES.map(t => (
                        <button key={t}
                            onClick={() => toggle(filterTimeline, t, setFilterTimeline)}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-all ${filterTimeline.includes(t) ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 text-gray-600 hover:border-purple-400 hover:text-purple-600'}`}
                        >{t}</button>
                    ))}
                </div>
            </div>
        </div>
    )

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
                                <span className="text-xs px-1.5 py-0.5 rounded-full text-white font-bold" style={{ background: '#7B2FBE' }}>
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
                    <FilterSidebar />
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
                    {/* Mobile filter toggle */}
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
                        <FilterSidebar />
                    </div>
                )}

                {/* Leads grid */}
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <SlidersHorizontal className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">Keine Leads gefunden</p>
                        <p className="text-sm text-gray-400 mt-1">Versuche andere Filter-Einstellungen.</p>
                        {activeFilterCount > 0 && (
                            <button onClick={clearAll} className="mt-3 text-sm text-purple-600 hover:underline">Filter zurücksetzen</button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {filtered.map(lead => {
                            const isPurchased = purchasedLeadIds.includes(lead.id)
                            const isInCart = cartLeadIds.includes(lead.id)
                            const isConsultation = lead.type === "CONSULTATION"

                            return (
                                <div key={lead.id} className={`relative rounded-xl border bg-white flex flex-col overflow-hidden transition-shadow hover:shadow-md ${isPurchased ? 'opacity-70' : ''} ${isConsultation ? 'border-purple-200' : 'border-gray-200'}`}>

                                    {/* Consultation premium top bar */}
                                    {isConsultation && (
                                        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #7B2FBE, #A855F7)' }} />
                                    )}

                                    <div className="p-4 flex-1 flex flex-col">
                                        {/* Header row */}
                                        <div className="flex justify-between items-start mb-3">
                                            {isConsultation ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-purple-700 bg-purple-100">
                                                    <Star className="h-3 w-3 fill-purple-500 text-purple-500" />
                                                    Beratung angefragt
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-blue-700 bg-blue-100">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Interesse
                                                </span>
                                            )}
                                            <span className={`font-bold text-lg ${isConsultation ? 'text-purple-700' : 'text-gray-800'}`}>
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

                                        {/* Details row */}
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

                                        {/* Budget + Timeline box */}
                                        <div className={`rounded-lg p-3 text-sm space-y-1.5 mb-3 ${isConsultation ? 'bg-purple-50' : 'bg-gray-50'}`}>
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
                                                <div className="pt-1 border-t border-purple-100">
                                                    <span className="text-xs text-purple-600 font-medium">✓ Budget bestätigt – hat Beratung angefragt</span>
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
                                    <div className={`px-4 py-3 border-t flex gap-2 ${isConsultation ? 'bg-purple-50/50 border-purple-100' : 'bg-gray-50/50 border-gray-100'}`}>
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
