/*
  Warnings:

  - You are about to alter the column `SellPrice` on the `FxqlRecords` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,4)` to `DoublePrecision`.
  - You are about to alter the column `BuyPrice` on the `FxqlRecords` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,4)` to `DoublePrecision`.
  - You are about to alter the column `CapAmount` on the `FxqlRecords` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "FxqlRecords" ALTER COLUMN "SellPrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "BuyPrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "CapAmount" SET DATA TYPE INTEGER;
