import { google } from "googleapis"

export async function getLeadsFromSheet() {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            },
            scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        })

        const sheets = google.sheets({ version: "v4", auth })
        const spreadsheetId = process.env.GOOGLE_SHEET_ID

        // Assume headers are in row 1, data starts row 2. Columns A-M
        const range = "Tabellenblatt1!A2:M"

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        })

        const rows = response.data.values
        if (!rows || rows.length === 0) {
            return []
        }

        return rows.map((row) => ({
            date: row[0],
            status: row[1],
            firstName: row[2],
            lastName: row[3],
            email: row[4],
            phone: row[5],
            zip: row[6],
            poolType: row[7],
            dimensions: row[8],
            features: row[9],
            price: row[10], // Est. Price
            timeline: row[11],
            budgetConfirmed: row[12],
        }))
    } catch (error) {
        console.error("Google Sheets Sync Error:", error)
        return []
    }
}
