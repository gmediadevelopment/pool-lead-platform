import { google } from 'googleapis'

// Initialize Google Sheets API
function getGoogleSheetsClient() {
    const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS
    if (!credentials) {
        throw new Error('GOOGLE_SHEETS_CREDENTIALS environment variable is not set')
    }

    // Decode base64 credentials
    const decodedCredentials = Buffer.from(credentials, 'base64').toString('utf-8')
    const credentialsJson = JSON.parse(decodedCredentials)

    const auth = new google.auth.GoogleAuth({
        credentials: credentialsJson,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    return google.sheets({ version: 'v4', auth })
}

// Fetch city from German postal code using OpenPLZ API
async function getCityFromPostalCode(zip: string): Promise<string> {
    try {
        const response = await fetch(`https://openplzapi.org/de/Localities?postalCode=${zip}`)
        const data = await response.json()

        if (data && data.length > 0) {
            return data[0].name || 'Unbekannt'
        }
        return 'Unbekannt'
    } catch (error) {
        console.error(`Failed to fetch city for postal code ${zip}:`, error)
        return 'Unbekannt'
    }
}

export interface LeadFromSheet {
    externalId: string
    date?: Date
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    zip?: string
    city?: string
    poolType?: string
    dimensions?: string
    features?: string
    estimatedPrice?: number
    timeline?: string
    budgetConfirmed: boolean
}

// Map sheet row to Lead object
export async function mapSheetRowToLead(row: any[], rowIndex: number): Promise<LeadFromSheet | null> {
    // Skip empty rows
    if (!row || row.length === 0 || !row[0]) {
        return null
    }

    const [
        datum,
        status,
        vorname,
        nachname,
        email,
        telefon,
        plz,
        pooltyp,
        einbau,
        masse,
        extras,
        preisSchatzung,
        bauzeitraum,
        budgetBestatigt
    ] = row

    // Skip if no essential data
    if (!vorname && !nachname && !email) {
        return null
    }

    // Get city from postal code
    const city = plz ? await getCityFromPostalCode(plz) : 'Unbekannt'

    // Parse date
    let parsedDate: Date | undefined
    if (datum) {
        try {
            parsedDate = new Date(datum)
        } catch (e) {
            console.warn(`Failed to parse date: ${datum}`)
        }
    }

    // Parse price
    let parsedPrice: number | undefined
    if (preisSchatzung) {
        const priceStr = preisSchatzung.toString().replace(/[^0-9.,]/g, '').replace(',', '.')
        const price = parseFloat(priceStr)
        if (!isNaN(price)) {
            parsedPrice = price
        }
    }

    // Parse budget confirmed
    const budgetConfirmed = budgetBestatigt?.toLowerCase() === 'ja' ||
        budgetBestatigt?.toLowerCase() === 'yes' ||
        budgetBestatigt === '1' ||
        budgetBestatigt === 'true'

    return {
        externalId: `row_${rowIndex}`,
        date: parsedDate,
        firstName: vorname || undefined,
        lastName: nachname || undefined,
        email: email || undefined,
        phone: telefon || undefined,
        zip: plz || undefined,
        city,
        poolType: pooltyp || undefined,
        dimensions: masse || undefined,
        features: extras || undefined,
        estimatedPrice: parsedPrice,
        timeline: bauzeitraum || undefined,
        budgetConfirmed,
    }
}

// Fetch all rows from Google Sheet
export async function getSheetData(): Promise<LeadFromSheet[]> {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
    const range = process.env.GOOGLE_SHEETS_RANGE || 'Sheet1!A:Z'

    if (!spreadsheetId) {
        throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID environment variable is not set')
    }

    const sheets = getGoogleSheetsClient()

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    })

    const rows = response.data.values
    if (!rows || rows.length === 0) {
        return []
    }

    // Skip header row (index 0) and map remaining rows
    const leads: LeadFromSheet[] = []
    for (let i = 1; i < rows.length; i++) {
        const lead = await mapSheetRowToLead(rows[i], i + 1) // +1 because sheet rows are 1-indexed
        if (lead) {
            leads.push(lead)
        }
    }

    return leads
}
