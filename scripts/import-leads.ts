import { getSheetData } from '../lib/google-sheets'
import { db } from '../lib/db'

async function importLeads() {
    console.log('🚀 Starting lead import from Google Sheets...')

    try {
        // Fetch leads from Google Sheet
        console.log('📊 Fetching data from Google Sheet...')
        const sheetLeads = await getSheetData()
        console.log(`✅ Found ${sheetLeads.length} leads in sheet`)

        let imported = 0
        let skipped = 0
        let errors = 0

        // Import each lead
        for (const lead of sheetLeads) {
            try {
                // Check if lead already exists
                const existing = await db.findLeadByExternalId(lead.externalId)

                if (existing) {
                    console.log(`⏭️  Skipping ${lead.externalId} (already exists)`)
                    skipped++
                    continue
                }

                // Import lead
                await db.createLeadFromSheet(lead)
                console.log(`✅ Imported ${lead.externalId}: ${lead.firstName} ${lead.lastName}`)
                imported++
            } catch (error) {
                console.error(`❌ Error importing ${lead.externalId}:`, error)
                errors++
            }
        }

        console.log('\n📊 Import Summary:')
        console.log(`   ✅ Imported: ${imported}`)
        console.log(`   ⏭️  Skipped: ${skipped}`)
        console.log(`   ❌ Errors: ${errors}`)
        console.log(`   📊 Total: ${sheetLeads.length}`)

    } catch (error) {
        console.error('❌ Import failed:', error)
        process.exit(1)
    }
}

// Run import
importLeads()
    .then(() => {
        console.log('\n✅ Import completed successfully!')
        process.exit(0)
    })
    .catch((error) => {
        console.error('\n❌ Import failed:', error)
        process.exit(1)
    })
