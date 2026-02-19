-- Fix lead types: all leads with price >= 99 should be CONSULTATION
-- This corrects legacy records that were created before the webhook type fix
UPDATE `Lead` 
SET type = 'CONSULTATION', updatedAt = NOW()
WHERE price >= 99 AND type != 'CONSULTATION';

-- Verify the update
SELECT COUNT(*) as fixed_leads FROM `Lead` WHERE type = 'CONSULTATION';
