ALTER TABLE `Lead` 
  ADD COLUMN `estimatedPriceMin` DECIMAL(10,2) NULL AFTER `features`,
  ADD COLUMN `estimatedPriceMax` DECIMAL(10,2) NULL AFTER `estimatedPriceMin`;
