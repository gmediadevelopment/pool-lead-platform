import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Ruler, Waves } from "lucide-react"
import { AddToCartButton } from "@/components/cart/add-to-cart-button"
import { BuyNowButton } from "@/components/cart/buy-now-button"

export default async function LeadsPage() {
    const session = await getServerSession(authOptions)
    const leads = await db.findPublishedLeads()

    // Get purchased lead IDs for this user
    let purchasedLeadIds: string[] = []
    let cartLeadIds: string[] = []

    if (session?.user?.id) {
        const purchasedLeads = await db.getPurchasedLeads(session.user.id)
        purchasedLeadIds = purchasedLeads.map((l: any) => l.id)

        const cartItems = await db.getCart(session.user.id)
        cartLeadIds = cartItems.map((item: any) => item.leadId)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Leads Marktplatz</h2>
                <div className="text-sm text-muted-foreground">
                    {leads.length} {leads.length === 1 ? 'Lead' : 'Leads'} verfügbar
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {leads.length === 0 ? (
                    <p className="text-muted-foreground col-span-3">Aktuell keine neuen Leads verfügbar.</p>
                ) : (
                    leads.map((lead) => {
                        const isPurchased = purchasedLeadIds.includes(lead.id)
                        const isInCart = cartLeadIds.includes(lead.id)

                        return (
                            <Card key={lead.id} className={`flex flex-col ${isPurchased ? 'opacity-75' : ''}`}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <Badge variant={lead.type === "CONSULTATION" ? "default" : "secondary"}>
                                            {lead.type === "CONSULTATION" ? "Beratung" : "Interesse"}
                                        </Badge>
                                        <span className="font-bold text-lg text-blue-600">
                                            {Number(lead.price).toFixed(0)}€
                                        </span>
                                    </div>
                                    <CardTitle className="mt-2 text-xl">{lead.poolType}</CardTitle>
                                    <div className="flex items-center text-muted-foreground text-sm gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {lead.zip} {lead.city}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Ruler className="h-4 w-4 text-muted-foreground" />
                                            <span>{lead.dimensions}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Waves className="h-4 w-4 text-muted-foreground" />
                                            <span>{lead.features ? "Extras vorhanden" : "Basis"}</span>
                                        </div>
                                    </div>
                                    <div className="bg-muted p-3 rounded-md text-sm space-y-2">
                                        <div className="flex justify-between">
                                            <span>Budget:</span>
                                            <span className="font-semibold">
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
                                                <span>Realisierung:</span>
                                                <span className="font-semibold">{lead.timeline}</span>
                                            </div>
                                        )}
                                    </div>
                                    {/* Blurred contact info preview */}
                                    <div className="mt-2 filter blur-[4px] select-none opacity-40 text-sm">
                                        <p>Max Mustermann</p>
                                        <p>Musterstraße 12</p>
                                        <p>0171 1234567</p>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex gap-2">
                                    <AddToCartButton
                                        leadId={lead.id}
                                        isInCart={isInCart}
                                        isPurchased={isPurchased}
                                        size="sm"
                                    />
                                    {!isPurchased && (
                                        <BuyNowButton
                                            leadId={lead.id}
                                            size="sm"
                                        />
                                    )}
                                </CardFooter>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    )
}
