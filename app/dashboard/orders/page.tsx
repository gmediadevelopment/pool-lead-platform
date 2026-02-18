import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, FileText, CheckCircle, Clock, XCircle } from "lucide-react"
import Link from "next/link"

function StatusBadge({ status }: { status: string }) {
    if (status === 'completed') {
        return (
            <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Abgeschlossen
            </Badge>
        )
    }
    if (status === 'pending') {
        return (
            <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                Ausstehend
            </Badge>
        )
    }
    return (
        <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Fehlgeschlagen
        </Badge>
    )
}

export default async function OrdersPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        redirect('/login')
    }

    const orders = await db.getUserOrders(session.user.id)

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center gap-3">
                <Package className="h-8 w-8" />
                <h2 className="text-3xl font-bold tracking-tight">Bestellhistorie</h2>
            </div>

            {orders.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <Package className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Noch keine Bestellungen</h3>
                        <p className="text-muted-foreground mb-6">
                            Kaufe Leads aus dem Marktplatz, um sie hier zu sehen.
                        </p>
                        <Link href="/dashboard/leads">
                            <Button>Zum Marktplatz</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {orders.map((order: any) => (
                        <Card key={order.id}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <StatusBadge status={order.status} />
                                            {order.invoiceNumber && (
                                                <span className="font-mono text-sm text-muted-foreground">
                                                    {order.invoiceNumber}
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-sm text-muted-foreground">
                                            {new Date(order.createdAt).toLocaleDateString('de-DE', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>

                                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                                            <div className="text-muted-foreground">Nettobetrag:</div>
                                            <div>{Number(order.subtotal - order.discount).toFixed(2)}€</div>

                                            {Number(order.discount) > 0 && (
                                                <>
                                                    <div className="text-muted-foreground">Rabatt:</div>
                                                    <div className="text-green-600">-{Number(order.discount).toFixed(2)}€</div>
                                                </>
                                            )}

                                            <div className="text-muted-foreground">MwSt. (19%):</div>
                                            <div>{Number(order.taxAmount).toFixed(2)}€</div>

                                            <div className="font-semibold">Gesamt:</div>
                                            <div className="font-semibold">{Number(order.total).toFixed(2)}€</div>
                                        </div>

                                        <div className="text-sm">
                                            <span className="text-muted-foreground">Zahlungsmethode: </span>
                                            <span className="capitalize">{order.paymentMethod}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 items-end">
                                        {order.status === 'completed' && (
                                            <Link href={`/dashboard/orders/${order.id}/invoice`}>
                                                <Button variant="outline" size="sm">
                                                    <FileText className="h-4 w-4 mr-1" />
                                                    Rechnung
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
