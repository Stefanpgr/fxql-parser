/*
  Warnings:

  - You are about to alter the column `CapAmount` on the `FxqlRecords` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,4)` to `BigInt`.
  - A unique constraint covering the columns `[SourceCurrency,DestinationCurrency]` on the table `FxqlRecords` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "FxqlRecords" ALTER COLUMN "CapAmount" SET DATA TYPE BIGINT;

-- CreateIndex
CREATE UNIQUE INDEX "FxqlRecords_SourceCurrency_DestinationCurrency_key" ON "FxqlRecords"("SourceCurrency", "DestinationCurrency");
