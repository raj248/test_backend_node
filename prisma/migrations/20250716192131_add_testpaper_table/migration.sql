/*
  Warnings:

  - You are about to drop the column `testPaperNumber` on the `MCQ` table. All the data in the column will be lost.
  - Added the required column `testPaperId` to the `MCQ` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "MCQ_testPaperNumber_idx";

-- AlterTable
ALTER TABLE "MCQ" DROP COLUMN "testPaperNumber",
ADD COLUMN     "testPaperId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "TestPaper" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TestPaper_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TestPaper_topicId_idx" ON "TestPaper"("topicId");

-- CreateIndex
CREATE INDEX "TestPaper_name_idx" ON "TestPaper"("name");

-- CreateIndex
CREATE INDEX "MCQ_testPaperId_idx" ON "MCQ"("testPaperId");

-- AddForeignKey
ALTER TABLE "TestPaper" ADD CONSTRAINT "TestPaper_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MCQ" ADD CONSTRAINT "MCQ_testPaperId_fkey" FOREIGN KEY ("testPaperId") REFERENCES "TestPaper"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
