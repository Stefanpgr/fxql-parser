-- CreateTable
CREATE TABLE "FxqlRecords" (
    "id" TEXT NOT NULL,
    "SourceCurrency" VARCHAR(4) NOT NULL,
    "DestinationCurrency" VARCHAR(4) NOT NULL,
    "SellPrice" DECIMAL(15,4) NOT NULL,
    "BuyPrice" DECIMAL(15,4) NOT NULL,
    "CapAmount" DECIMAL(15,4) NOT NULL,

    CONSTRAINT "FxqlRecords_pkey" PRIMARY KEY ("id")
);
