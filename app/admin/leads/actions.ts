'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'

export async function updateLeadAction(leadId: string, formData: FormData) {
    try {
        const data = {
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string || undefined,
            zip: formData.get('zip') as string,
            city: formData.get('city') as string,
            poolType: formData.get('poolType') as string,
            dimensions: formData.get('dimensions') as string,
            features: formData.get('features') as string || undefined,
            estimatedPriceMin: formData.get('estimatedPriceMin') ? parseFloat(formData.get('estimatedPriceMin') as string) : undefined,
            estimatedPriceMax: formData.get('estimatedPriceMax') ? parseFloat(formData.get('estimatedPriceMax') as string) : undefined,
            timeline: formData.get('timeline') as string || undefined,
            budgetConfirmed: formData.get('budgetConfirmed') === 'true',
            price: parseFloat(formData.get('price') as string),
        }

        await db.updateLead(leadId, data)
        revalidatePath('/admin/leads')
        return { success: true }
    } catch (error) {
        console.error('Failed to update lead:', error)
        return { success: false, error: 'Fehler beim Aktualisieren des Leads' }
    }
}

export async function deleteLeadAction(leadId: string) {
    try {
        await db.deleteLead(leadId)
        revalidatePath('/admin/leads')
    } catch (error) {
        console.error('Failed to delete lead:', error)
    }
}

export async function unpublishLeadAction(leadId: string) {
    try {
        await db.unpublishLead(leadId)
        revalidatePath('/admin/leads')
        revalidatePath('/admin')
    } catch (error) {
        console.error('Failed to unpublish lead:', error)
    }
}
