-- CreateEnum
CREATE TABLE IF NOT EXISTS `Role` (
  `value` VARCHAR(191) NOT NULL PRIMARY KEY
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `Role` (`value`) VALUES ('ADMIN'), ('COMPANY');

-- CreateEnum
CREATE TABLE IF NOT EXISTS `LeadStatus` (
  `value` VARCHAR(191) NOT NULL PRIMARY KEY
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `LeadStatus` (`value`) VALUES ('NEW'), ('VERIFIED'), ('PUBLISHED'), ('SOLD'), ('ARCHIVED');

-- CreateEnum
CREATE TABLE IF NOT EXISTS `LeadType` (
  `value` VARCHAR(191) NOT NULL PRIMARY KEY
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `LeadType` (`value`) VALUES ('INTEREST'), ('CONSULTATION');

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'COMPANY') NOT NULL DEFAULT 'COMPANY',
    `companyName` VARCHAR(191) NULL,
    `contactPerson` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `radius` INTEGER NULL,
    `credits` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServiceArea` (
    `id` VARCHAR(191) NOT NULL,
    `zip` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Specialty` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lead` (
    `id` VARCHAR(191) NOT NULL,
    `externalId` VARCHAR(191) NULL,
    `date` DATETIME(3) NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `zip` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `poolType` VARCHAR(191) NULL,
    `dimensions` VARCHAR(191) NULL,
    `features` VARCHAR(191) NULL,
    `estimatedPrice` DECIMAL(65, 30) NULL,
    `timeline` VARCHAR(191) NULL,
    `budgetConfirmed` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('NEW', 'VERIFIED', 'PUBLISHED', 'SOLD', 'ARCHIVED') NOT NULL DEFAULT 'NEW',
    `type` ENUM('INTEREST', 'CONSULTATION') NOT NULL DEFAULT 'INTEREST',
    `price` DECIMAL(65, 30) NOT NULL DEFAULT 49.00,
    `exclusive` BOOLEAN NOT NULL DEFAULT true,
    `maxSales` INTEGER NOT NULL DEFAULT 1,
    `salesCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction` (
    `id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `paymentId` VARCHAR(191) NULL,
    `invoiceUrl` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `leadId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PurchasedLeads` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_PurchasedLeads_AB_unique`(`A`, `B`),
    INDEX `_PurchasedLeads_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ServiceArea` ADD CONSTRAINT `ServiceArea_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Specialty` ADD CONSTRAINT `Specialty_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `Lead`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PurchasedLeads` ADD CONSTRAINT `_PurchasedLeads_A_fkey` FOREIGN KEY (`A`) REFERENCES `Lead`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PurchasedLeads` ADD CONSTRAINT `_PurchasedLeads_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
