-- CreateTable
CREATE TABLE "NewlyAdded" (
    "id" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "NewlyAdded_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NewlyAdded_tableName_idx" ON "NewlyAdded"("tableName");

-- CreateIndex
CREATE INDEX "NewlyAdded_entityId_idx" ON "NewlyAdded"("entityId");

-- CreateIndex
CREATE INDEX "NewlyAdded_addedAt_idx" ON "NewlyAdded"("addedAt");
