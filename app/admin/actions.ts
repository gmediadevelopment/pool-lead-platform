"use server"

import { prisma } from "@/lib/prisma"
import { LeadStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function verifyLead(leadId: string) {
    await prisma.lead.update({
        where: { id: leadId },
        data: { status: LeadStatus.PUBLISHED }, // Or VERIFIED if intermediate step
    })
    revalidatePath("/admin")
}

export async function rejectLead(leadId: string) {
    await prisma.lead.update({
        where: { id: leadId },
        data: { status: LeadStatus.ARCHIVED },
    })
    revalidatePath("/admin")
}
