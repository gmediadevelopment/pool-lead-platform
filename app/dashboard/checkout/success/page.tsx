import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Package, ArrowRight, FileText } from "lucide-react"
import Link from "next/link"

export default async function CheckoutSuccessPage({
    searchParams
}: {
    searchParams: { session_id?: string; orderId?: string }
}) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        redirect('/login')
    }

    // Try to get order details
    let order: any = null
    if (searchParams.orderId) {
        try {
            order = await db.getOrderById(searchParams.orderId)
        } catch (e) {
            // Order might not be ready yet
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl text-green-700">Zahlung erfolgreich!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-center">
                    <p className="text-muted-foreground">
                        Vielen Dank für Ihren Kauf! Ihre Leads wurden freigeschaltet und sind
                        jetzt in Ihrem Dashboard verfügbar.
                    </p>

                    {order && (
                        <div className="bg-muted p-4 rounded-lg text-left space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Rechnungsnummer:</span>
                                <span className="font-mono font-semibold">{order.invoiceNumber}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Betrag:</span>
                                <span className="font-semibold">{Number(order.total).toFixed(2)}€</span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <Link href="/dashboard/my-leads">
                            <Button className="w-full">
                                <Package className="h-4 w-4 mr-2" />
                                Meine Leads anzeigen
                            </Button>
                        </Link>

                        <Link href="/dashboard/orders">
                            <Button variant="outline" className="w-full">
                                <FileText className="h-4 w-4 mr-2" />
                                Bestellhistorie & Rechnung
                            </Button>
                        </Link>

                        <Link href="/dashboard/leads">
                            <Button variant="ghost" className="w-full">
                                Weitere Leads kaufen
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Eine Rechnung mit ausgewiesener MwSt. wird Ihnen per E-Mail zugesendet.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
