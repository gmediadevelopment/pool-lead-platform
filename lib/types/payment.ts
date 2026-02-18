import { Lead } from '../db'

// Cart and Order interfaces
export interface CartItem {
    id: string
    userId: string
    leadId: string
    addedAt: Date
    lead?: Lead  // Populated lead data
}

export interface Order {
    id: string
    userId: string
    subtotal: number
    discount: number
    taxRate: number
    taxAmount: number
    total: number
    paymentMethod: 'stripe' | 'paypal'
    paymentId: string
    status: 'pending' | 'completed' | 'failed'
    invoiceNumber?: string
    createdAt: Date
    completedAt?: Date
}

export interface OrderItem {
    id: string
    orderId: string
    leadId: string
    price: number
}

export interface OrderWithItems extends Order {
    items: (OrderItem & { lead?: Lead })[]
}
