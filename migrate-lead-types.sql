-- KORREKTUR: Leads mit Beratungsdaten auf CONSULTATION + 99 Euro setzen
-- Erkennungsmerkmal: budgetConfirmed=1 ODER timeline gesetzt
UPDATE Lead SET type = 'CONSULTATION', price = 99.00, updatedAt = NOW()
WHERE budgetConfirmed = 1 OR (timeline IS NOT NULL AND timeline != '');

-- Alle anderen sicherstellen: INTEREST + 49 Euro
UPDATE Lead SET type = 'INTEREST', price = 49.00, updatedAt = NOW()
WHERE budgetConfirmed = 0 AND (timeline IS NULL OR timeline = '');
