import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, MapPin, Star } from "lucide-react"
import { verifyLead, rejectLead } from "./actions"
import { SyncButton } from "./sync-button"

export default async function AdminDashboard() {
    const newLeads = await db.findNewLeads()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">Neue Leads prüfen</h1>
                    <p className="text-muted-foreground">Folgende Leads warten auf Freigabe.</p>
                </div>
                <SyncButton />
            </div>

            <div className="grid gap-6">
                {newLeads.length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-center text-muted-foreground">
                            Keine neuen Leads zur Prüfung.
                        </CardContent>
                    </Card>
                ) : (
                    newLeads.map((lead) => {
                        // Only use type field - NOT price, because lead price (1% of pool budget)
                        // can exceed 99€ for expensive pools even when type is INTEREST
                        const isConsultation = lead.type === 'CONSULTATION'
                        return (
                            <Card key={lead.id} className={isConsultation ? 'border-blue-300 shadow-sm shadow-blue-100' : ''}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <CardTitle>{lead.firstName} {lead.lastName}</CardTitle>
                                                {isConsultation && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                        <Star className="h-3 w-3 fill-blue-500 text-blue-500" />
                                                        Beratung angefragt – 99€
                                                    </span>
                                                )}
                                            </div>
                                            <CardDescription className="flex items-center mt-1">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {lead.zip} {lead.city}
                                            </CardDescription>
                                        </div>
                                        <Badge variant="outline">{lead.poolType}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                                                    <p>{lead.estimatedPriceMin.toLocaleString()} €</p>
                                                ) : (
                                                    <p>{lead.estimatedPriceMin.toLocaleString()} € - {lead.estimatedPriceMax.toLocaleString()} €</p>
                                                )
                                            ) : lead.estimatedPrice ? (
                                                <p>{Number(lead.estimatedPrice).toLocaleString()} €</p>
                                            ) : (
                                                <p>Keine Angabe</p>
                                            )}
                                        </div>
                                        {((lead.timeline && lead.timeline !== '') || lead.budgetConfirmed) && (
                                            <div>
                                                <p className="font-semibold">Beratung</p>
                                                {lead.timeline && lead.timeline !== '' && <p>Bauzeitraum: {lead.timeline}</p>}
                                                {Boolean(lead.budgetConfirmed) && <p className="text-green-600">✓ Budget bestätigt</p>}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2 bg-muted/50 p-4">
                                    <form action={rejectLead.bind(null, lead.id)}>
                                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                            <X className="h-4 w-4 mr-1" />
                                            Ablehnen
                                        </Button>
                                    </form>
                                    <form action={verifyLead.bind(null, lead.id)}>
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                            <Check className="h-4 w-4 mr-1" />
                                            Freigeben &amp; Veröffentlichen
                                        </Button>
                                    </form>
                                </CardFooter>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    )
}
