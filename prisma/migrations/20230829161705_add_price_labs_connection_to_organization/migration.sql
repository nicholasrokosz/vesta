-- CreateTable
CREATE TABLE "PriceLabsConnection" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountEmail" TEXT NOT NULL,

    CONSTRAINT "PriceLabsConnection_pkey" PRIMARY KEY ("id")
);
