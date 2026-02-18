import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, ShoppingCart } from "lucide-react"
import Link from "next/link"

export default function CheckoutCancelPage() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <XCircle className="h-16 w-16 text-red-400" />
                    </div>
                    <CardTitle className="text-2xl">Zahlung abgebrochen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-center">
                    <p className="text-muted-foreground">
                        Die Zahlung wurde abgebrochen. Ihr Warenkorb wurde nicht verändert.
                        Sie können den Kauf jederzeit erneut starten.
                    </p>

                    <div className="space-y-3">
                        <Link href="/dashboard/cart">
                            <Button className="w-full">
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Zurück zum Warenkorb
                            </Button>
                        </Link>

                        <Link href="/dashboard/leads">
                            <Button variant="outline" className="w-full">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Zum Marktplatz
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
