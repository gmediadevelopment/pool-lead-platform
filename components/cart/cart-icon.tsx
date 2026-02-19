'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CartIcon() {
    const [count, setCount] = useState(0)

    useEffect(() => {
        async function fetchCartCount() {
            try {
                const res = await fetch('/api/cart')
                if (res.ok) {
                    const data = await res.json()
                    setCount(data.items?.length || 0)
                }
            } catch {
                // Ignore errors
            }
        }

        fetchCartCount()
        // Refresh every 30 seconds
        const interval = setInterval(fetchCartCount, 30000)
        // Also refresh instantly when cart changes (fired by add/remove buttons)
        window.addEventListener('cart-updated', fetchCartCount)
        return () => {
            clearInterval(interval)
            window.removeEventListener('cart-updated', fetchCartCount)
        }
    }, [])

    return (
        <Link href="/dashboard/cart">
            <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {count > 0 && (
                    <span className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
                        style={{ background: '#7B2FBE' }}>
                        {count > 9 ? '9+' : count}
                    </span>
                )}
            </Button>
        </Link>
    )
}
