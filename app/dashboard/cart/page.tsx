import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, MapPin, Ruler, Trash2, ArrowRight, Tag } from "lucide-react"
import Link from "next/link"
import { RemoveFromCartButton } from "@/components/cart/remove-from-cart-button"

export default async function CartPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        redirect('/login')
    }

    const cartItems = await db.getCart(session.user.id)

    // Calculate pricing
    const subtotal = cartItems.reduce((sum: number, item: any) => sum + Number(item.price), 0)
    const itemCount = cartItems.length
    const discountRate = itemCount >= 5 ? 0.05 : 0
    const discountAmount = subtotal * discountRate
    const subtotalAfterDiscount = subtotal - discountAmount
    const taxRate = 0.19
    const taxAmount = subtotalAfterDiscount * taxRate
    const total = subtotalAfterDiscount + taxAmount

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center gap-3">
                <ShoppingCart className="h-8 w-8" />
                <h2 className="text-3xl font-bold tracking-tight">Warenkorb</h2>
                {itemCount > 0 && (
                    <Badge variant="secondary" className="text-base px-3 py-1">
                        {itemCount} {itemCount === 1 ? 'Lead' : 'Leads'}
                    </Badge>
                )}
            </div>

            {cartItems.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Ihr Warenkorb ist leer</h3>
                        <p className="text-muted-foreground mb-6">
                            Fügen Sie Leads aus dem Marktplatz zu Ihrem Warenkorb hinzu.
                        </p>
                        <Link href="/dashboard/leads">
                            <Button>
                                Zum Marktplatz
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item: any) => (
                            <Card key={item.leadId}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={item.type === "CONSULTATION" ? "default" : "secondary"}>
                                                    {item.type === "CONSULTATION" ? "Beratung" : "Interesse"}
                                                </Badge>
                                                <span className="font-semibold text-lg">{item.poolType}</span>
                                            </div>
                                            <div className="flex items-center text-muted-foreground text-sm gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {item.zip} {item.city}
                                            </div>
                                            <div className="flex items-center text-sm gap-2">
                                                <Ruler className="h-3 w-3 text-muted-foreground" />
                                                {item.dimensions}
                                            </div>
                                            {item.timeline && (
                                                <div className="text-sm text-muted-foreground">
                                                    Realisierung: {item.timeline}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="font-bold text-xl">{Number(item.price).toFixed(0)}€</span>
                                            <RemoveFromCartButton leadId={item.leadId} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Bestellübersicht</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span>Zwischensumme ({itemCount} Leads)</span>
                                    <span>{subtotal.toFixed(2)}€</span>
                                </div>

                                {discountRate > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span className="flex items-center gap-1">
                                            <Tag className="h-3 w-3" />
                                            Mengenrabatt (5%)
                                        </span>
                                        <span>-{discountAmount.toFixed(2)}€</span>
                                    </div>
                                )}

                                {itemCount < 5 && (
                                    <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded text-xs text-blue-700 dark:text-blue-300">
                                        💡 Noch {5 - itemCount} Lead{5 - itemCount !== 1 ? 's' : ''} bis 5% Rabatt!
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

                                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                                    <span>Gesamt</span>
                                    <span>{total.toFixed(2)}€</span>
                                </div>

                                <Link href="/dashboard/checkout" className="block">
                                    <Button className="w-full" size="lg">
                                        Zur Kasse
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </Link>

                                <Link href="/dashboard/leads" className="block">
                                    <Button variant="outline" className="w-full">
                                        Weiter einkaufen
                                    </Button>
                                </Link>

                                <p className="text-xs text-muted-foreground text-center">
                                    🔒 Sichere Zahlung via Stripe oder PayPal
                                </p>
                                <p className="text-xs text-muted-foreground text-center">
                                    ⚠️ Kein Rückgaberecht auf digitale Produkte
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    )
}
