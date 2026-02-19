'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Check, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AddToCartButtonProps {
    leadId: string
    isInCart?: boolean
    isPurchased?: boolean
    size?: 'sm' | 'default'
}

export function AddToCartButton({ leadId, isInCart = false, isPurchased = false, size = 'default' }: AddToCartButtonProps) {
    const [loading, setLoading] = useState(false)
    const [inCart, setInCart] = useState(isInCart)
    const router = useRouter()

    if (isPurchased) {
        return (
            <Button variant="outline" size={size} disabled className="text-green-600 border-green-600">
                <Check className="h-4 w-4 mr-1" />
                Gekauft
            </Button>
        )
    }

    async function handleAddToCart() {
        if (inCart) {
            router.push('/dashboard/cart')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId }),
            })

            if (res.ok) {
                setInCart(true)
                window.dispatchEvent(new Event('cart-updated'))
                router.refresh()
            } else {
                const data = await res.json()
                alert(data.error || 'Fehler beim Hinzufügen')
            }
        } catch (error) {
            alert('Netzwerkfehler. Bitte versuche es erneut.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant={inCart ? 'secondary' : 'outline'}
            size={size}
            onClick={handleAddToCart}
            disabled={loading}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
                <ShoppingCart className="h-4 w-4 mr-1" />
            )}
            {inCart ? 'Im Warenkorb' : 'In den Warenkorb'}
        </Button>
    )
}
