import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Lock, AlertCircle } from "lucide-react"
import { CheckoutForm } from "@/components/checkout/checkout-form"

export default async function CheckoutPage({
    searchParams
}: {
    searchParams: { leadId?: string }
}) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        redirect('/login')
    }

    // Get cart items (or single item for one-click purchase)
    let cartItems: any[] = []

    if (searchParams.leadId) {
        // One-click purchase: get single lead
        const leads = await db.findPublishedLeads()
        const lead = leads.find((l: any) => l.id === searchParams.leadId)
        if (lead) {
            cartItems = [{ ...lead, leadId: lead.id }]
        }
    } else {
        // Normal cart checkout
        cartItems = await db.getCart(session.user.id)
    }

    if (cartItems.length === 0) {
        redirect('/dashboard/cart')
    }

    // Calculate pricing
    const subtotal = cartItems.reduce((sum: number, item: any) => sum + Number(item.price), 0)
    const itemCount = cartItems.length
    const discountRate = itemCount >= 5 ? 0.05 : 0
    const discountAmount = subtotal * discountRate
    const subtotalAfterDiscount = subtotal - discountAmount
    const taxRate = 0.19
    const taxAmount = subtotalAfterDiscount * taxRate
    const total = subtotalAfterDiscount + taxAmount

    const orderSummary = {
        items: cartItems,
        subtotal,
        discountRate,
        discountAmount,
        subtotalAfterDiscount,
        taxRate,
        taxAmount,
        total,
        isSingleItem: !!searchParams.leadId
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Kasse</h2>
                <p className="text-muted-foreground">Schließe deinen Kauf sicher ab</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
                {/* Order Summary */}
                <div className="lg:col-span-2 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Bestellübersicht</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* Items */}
                            <div className="space-y-2">
                                {cartItems.map((item: any) => (
                                    <div key={item.leadId || item.id} className="flex justify-between text-sm">
                                        <div>
                                            <div className="font-medium">{item.poolType}</div>
                                            <div className="text-muted-foreground flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {item.zip} {item.city}
                                            </div>
                                        </div>
                                        <span className="font-medium">{Number(item.price).toFixed(0)}€</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-3 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Zwischensumme</span>
                                    <span>{subtotal.toFixed(2)}€</span>
                                </div>

                                {discountRate > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Mengenrabatt (5%)</span>
                                        <span>-{discountAmount.toFixed(2)}€</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Nettobetrag</span>
                                    <span>{subtotalAfterDiscount.toFixed(2)}€</span>
                                </div>

                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>MwSt. (19%)</span>
                                    <span>{taxAmount.toFixed(2)}€</span>
                                </div>

                                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                    <span>Gesamt</span>
                                    <span>{total.toFixed(2)}€</span>
                                </div>
                            </div>

                            {/* Security notice */}
                            <div className="bg-muted p-3 rounded-md space-y-1">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Lock className="h-3 w-3" />
                                    <span>Sichere SSL-verschlüsselte Zahlung</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <AlertCircle className="h-3 w-3" />
                                    <span>Kein Rückgaberecht auf digitale Produkte</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Payment Form */}
                <div className="lg:col-span-3">
                    <CheckoutForm
                        orderSummary={orderSummary}
                        userId={session.user.id}
                    />
                </div>
            </div>
        </div>
    )
}
