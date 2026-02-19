import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, MapPin, Euro, Users } from "lucide-react"

export default async function SoldLeadsPage() {
    const soldLeads = await db.getSoldLeads()

    const totalRevenue = soldLeads.reduce((sum: number, lead: any) => {
        return sum + (Number(lead.purchasePrice) || 0)
    }, 0)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Verkaufte Leads</h1>
                    <p className="text-muted-foreground">Übersicht aller verkauften Leads und Käufer</p>
                </div>
                <div className="flex gap-4">
                    <Card className="px-4 py-2">
                        <div className="text-sm text-muted-foreground">Verkaufte Leads</div>
                        <div className="text-2xl font-bold text-blue-600">{soldLeads.length}</div>
                    </Card>
                    <Card className="px-4 py-2">
                        <div className="text-sm text-muted-foreground">Gesamtumsatz</div>
                        <div className="text-2xl font-bold text-green-600">{totalRevenue.toFixed(2)}€</div>
                    </Card>
                </div>
            </div>

            {soldLeads.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Noch keine Leads verkauft.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {soldLeads.map((lead: any) => (
                        <Card key={lead.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">
                                            {lead.firstName} {lead.lastName}
                                        </CardTitle>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                            <MapPin className="h-3 w-3" />
                                            {lead.zip} {lead.city}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <Badge variant="outline">{lead.poolType}</Badge>
                                        <Badge className="bg-green-600">
                                            <Euro className="h-3 w-3 mr-1" />
                                            {Number(lead.purchasePrice || lead.price).toFixed(2)}€
                                        </Badge>
                                        <Badge variant="secondary">
                                            {lead.status === 'SOLD' ? 'Ausverkauft' : 'Teilverkauft'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="font-semibold text-muted-foreground">Lead-Kontakt</p>
                                        <p>{lead.email}</p>
                                        <p>{lead.phone}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-muted-foreground">Pool</p>
                                        <p>{lead.poolType}</p>
                                        <p>{lead.dimensions}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-muted-foreground">Verkäufe</p>
                                        <div className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            <span>{lead.buyerCount} Käufer</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Max: {lead.maxSales}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-muted-foreground">Käufer (E-Mail)</p>
                                        <p className="text-xs break-all">{lead.buyerEmails}</p>
                                    </div>
                                </div>
                                <div className="mt-3 text-xs text-muted-foreground">
                                    Zuletzt verkauft: {lead.lastSoldAt ? new Date(lead.lastSoldAt).toLocaleString('de-DE') : '–'}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
