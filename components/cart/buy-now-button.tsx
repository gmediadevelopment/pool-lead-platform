'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Zap, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BuyNowButtonProps {
    leadId: string
    isPurchased?: boolean
    size?: 'sm' | 'default'
}

export function BuyNowButton({ leadId, isPurchased = false, size = 'default' }: BuyNowButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    if (isPurchased) return null

    async function handleBuyNow() {
        setLoading(true)
        try {
            // Add to cart first, then redirect to checkout
            await fetch('/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId }),
            })
            // Redirect to checkout with single item
            router.push(`/dashboard/checkout?leadId=${leadId}`)
        } catch (error) {
            alert('Fehler. Bitte versuche es erneut.')
            setLoading(false)
        }
    }

    return (
        <Button
            size={size}
            onClick={handleBuyNow}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
        >
            {loading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
                <Zap className="h-4 w-4 mr-1" />
            )}
            Jetzt kaufen
        </Button>
    )
}
