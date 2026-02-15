import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { BuyButton } from "@/components/buy-button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Ruler, Waves } from "lucide-react"

export default async function LeadsPage() {
    const leads = await prisma.lead.findMany({
        where: {
            status: "PUBLISHED",
        },
        orderBy: {
            createdAt: "desc",
        },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Leads Marktplatz</h2>
                <div>
                    {/* Filter options could go here */}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {leads.length === 0 ? (
                    <p className="text-muted-foreground">Aktuell keine neuen Leads verfügbar.</p>
                ) : (
                    leads.map((lead) => (
                        <Card key={lead.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <Badge variant={lead.type === "CONSULTATION" ? "default" : "secondary"}>
                                        {lead.type === "CONSULTATION" ? "Beratung" : "Interesse"}
                                    </Badge>
                                    <span className="font-bold text-lg">{Number(lead.price).toFixed(2)} €</span>
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
                                        <span className="font-semibold">{Number(lead.estimatedPrice).toLocaleString()} €</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Realisierung:</span>
                                        <span className="font-semibold">{lead.timeline}</span>
                                    </div>
                                </div>
                                {/* Blur Effect for specific data */}
                                <div className="mt-4 filter blur-[3px] select-none opacity-50">
                                    <p>Max Mustermann</p>
                                    <p>Musterstraße 12</p>
                                    <p>0171 1234567</p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <BuyButton leadId={lead.id} price={Number(lead.price)} />
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
