'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard, Check } from 'lucide-react'

interface OrderSummary {
    items: any[]
    subtotal: number
    discountRate: number
    discountAmount: number
    subtotalAfterDiscount: number
    taxRate: number
    taxAmount: number
    total: number
    isSingleItem: boolean
}

interface CheckoutFormProps {
    orderSummary: OrderSummary
    userId: string
}

export function CheckoutForm({ orderSummary, userId }: CheckoutFormProps) {
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | null>(null)
    const [loading, setLoading] = useState(false)
    const [agreed, setAgreed] = useState(false)

    async function handleStripeCheckout() {
        if (!agreed) {
            alert('Bitte stimme den AGB zu.')
            return
        }
        setLoading(true)
        try {
            const res = await fetch('/api/checkout/stripe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: orderSummary.items.map(item => ({
                        leadId: item.leadId || item.id,
                        price: Number(item.price)
                    })),
                    isSingleItem: orderSummary.isSingleItem
                })
            })

            const data = await res.json()

            if (data.url) {
                window.location.href = data.url
            } else {
                alert(data.error || 'Fehler beim Starten der Zahlung')
                setLoading(false)
            }
        } catch (error) {
            alert('Netzwerkfehler. Bitte versuche es erneut.')
            setLoading(false)
        }
    }

    return (
        <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-800">Zahlungsmethode wählen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                {/* Payment Method Selection */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Kreditkarte */}
                    <button
                        type="button"
                        onClick={() => setPaymentMethod('stripe')}
                        style={{
                            padding: '16px',
                            border: paymentMethod === 'stripe' ? '2px solid #1d4ed8' : '2px solid #e5e7eb',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            background: paymentMethod === 'stripe' ? '#eff6ff' : '#ffffff',
                            transition: 'all 0.15s ease',
                            position: 'relative',
                        }}
                    >
                        {paymentMethod === 'stripe' && (
                            <span style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: '#1d4ed8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                    <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                        )}
                        <CreditCard style={{ width: '28px', height: '28px', color: '#1d4ed8' }} />
                        <span style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>Kreditkarte</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Visa, Mastercard, etc.</span>
                    </button>

                    {/* PayPal */}
                    <button
                        type="button"
                        onClick={() => setPaymentMethod('paypal')}
                        style={{
                            padding: '16px',
                            border: paymentMethod === 'paypal' ? '2px solid #003087' : '2px solid #e5e7eb',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            background: paymentMethod === 'paypal' ? '#f0f4ff' : '#ffffff',
                            transition: 'all 0.15s ease',
                            position: 'relative',
                        }}
                    >
                        {paymentMethod === 'paypal' && (
                            <span style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: '#003087',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                    <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                        )}
                        {/* PayPal Logo */}
                        <svg style={{ height: '28px', width: '80px' }} viewBox="0 0 124 33" xmlns="http://www.w3.org/2000/svg">
                            <path fill="#009cde" d="M46.211 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265a.95.95 0 0 0 .939-.803l.746-4.73a.95.95 0 0 1 .938-.803h2.165c4.505 0 7.105-2.18 7.784-6.5.306-1.89.013-3.375-.872-4.415-.972-1.142-2.696-1.746-4.985-1.746zM47 13.154c-.374 2.454-2.249 2.454-4.062 2.454h-1.032l.724-4.583a.57.57 0 0 1 .563-.481h.473c1.235 0 2.4 0 3.002.704.359.42.469 1.044.332 1.906zM66.654 13.075h-3.275a.57.57 0 0 0-.563.481l-.145.916-.229-.332c-.709-1.029-2.29-1.373-3.868-1.373-3.619 0-6.71 2.741-7.312 6.586-.313 1.918.132 3.752 1.22 5.031.998 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .562.66h2.95a.95.95 0 0 0 .939-.803l1.77-11.209a.568.568 0 0 0-.561-.658zm-4.565 6.374c-.316 1.871-1.801 3.127-3.695 3.127-.951 0-1.711-.305-2.199-.883-.484-.574-.668-1.391-.514-2.301.295-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.499.589.697 1.411.554 2.317zM84.096 13.075h-3.291a.954.954 0 0 0-.787.417l-4.539 6.686-1.924-6.425a.953.953 0 0 0-.912-.678h-3.234a.57.57 0 0 0-.541.754l3.625 10.638-3.408 4.811a.57.57 0 0 0 .465.9h3.287a.949.949 0 0 0 .781-.408l10.946-15.8a.57.57 0 0 0-.468-.895z" />
                            <path fill="#003087" d="M94.992 6.749h-6.84a.95.95 0 0 0-.938.802l-2.766 17.537a.569.569 0 0 0 .562.658h3.51a.665.665 0 0 0 .656-.562l.785-4.971a.95.95 0 0 1 .938-.803h2.164c4.506 0 7.105-2.18 7.785-6.5.307-1.89.012-3.375-.873-4.415-.971-1.142-2.694-1.746-4.983-1.746zm.789 6.405c-.373 2.454-2.248 2.454-4.062 2.454h-1.031l.725-4.583a.568.568 0 0 1 .562-.481h.473c1.234 0 2.4 0 3.002.704.359.42.468 1.044.331 1.906zM115.434 13.075h-3.273a.567.567 0 0 0-.562.481l-.145.916-.23-.332c-.709-1.029-2.289-1.373-3.867-1.373-3.619 0-6.710 2.741-7.313 6.586-.312 1.918.133 3.752 1.221 5.031 1 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .564.66h2.949a.95.95 0 0 0 .938-.803l1.771-11.209a.571.571 0 0 0-.565-.658zm-4.565 6.374c-.314 1.871-1.801 3.127-3.695 3.127-.949 0-1.711-.305-2.199-.883-.484-.574-.666-1.391-.514-2.301.297-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.501.589.699 1.411.554 2.317zM119.295 7.23l-2.807 17.858a.569.569 0 0 0 .562.658h2.822c.469 0 .867-.34.939-.803l2.768-17.536a.57.57 0 0 0-.562-.659h-3.16a.571.571 0 0 0-.562.482z" />
                        </svg>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>PayPal, Kreditkarte</span>
                    </button>
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        id="terms"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground">
                        Ich stimme den{' '}
                        <a href="/agb" className="text-blue-600 hover:underline" target="_blank">
                            Allgemeinen Geschäftsbedingungen
                        </a>{' '}
                        zu und bestätige, dass ich die{' '}
                        <a href="/datenschutz" className="text-blue-600 hover:underline" target="_blank">
                            Datenschutzerklärung
                        </a>{' '}
                        gelesen habe. Ich bin damit einverstanden, dass{' '}
                        <strong>kein Rückgaberecht</strong> für digitale Produkte gilt.
                    </label>
                </div>

                {/* Pay Button */}
                {paymentMethod === 'stripe' && (
                    <Button
                        className="w-full"
                        size="lg"
                        onClick={handleStripeCheckout}
                        disabled={loading || !agreed}
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <CreditCard className="h-4 w-4 mr-2" />
                        )}
                        {orderSummary.total.toFixed(2)}€ mit Kreditkarte bezahlen
                    </Button>
                )}

                {paymentMethod === 'paypal' && (
                    <PayPalCheckoutButton
                        orderSummary={orderSummary}
                        agreed={agreed}
                    />
                )}

                {!paymentMethod && (
                    <Button className="w-full" size="lg" disabled>
                        Zahlungsmethode wählen
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}

// PayPal button component
function PayPalCheckoutButton({ orderSummary, agreed }: { orderSummary: OrderSummary, agreed: boolean }) {
    const [loading, setLoading] = useState(false)

    async function handlePayPalCheckout() {
        if (!agreed) {
            alert('Bitte stimme den AGB zu.')
            return
        }
        setLoading(true)
        try {
            const res = await fetch('/api/checkout/paypal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: orderSummary.items.map(item => ({
                        leadId: item.leadId || item.id,
                        price: Number(item.price)
                    })),
                    isSingleItem: orderSummary.isSingleItem
                })
            })

            const data = await res.json()

            if (data.approvalUrl) {
                window.location.href = data.approvalUrl
            } else {
                alert(data.error || 'Fehler beim Starten der PayPal-Zahlung')
                setLoading(false)
            }
        } catch (error) {
            alert('Netzwerkfehler. Bitte versuche es erneut.')
            setLoading(false)
        }
    }

    return (
        <Button
            className="w-full"
            size="lg"
            style={{ background: '#003087', color: 'white' }}
            onClick={handlePayPalCheckout}
            disabled={loading || !agreed}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            {orderSummary.total.toFixed(2)}€ mit PayPal bezahlen
        </Button>
    )
}
