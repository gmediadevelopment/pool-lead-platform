"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function verifyLead(leadId: string) {
    await db.updateLeadStatus(leadId, 'PUBLISHED')
    revalidatePath("/admin")
}

export async function rejectLead(leadId: string) {
    await db.updateLeadStatus(leadId, 'ARCHIVED')
    revalidatePath("/admin")
}
