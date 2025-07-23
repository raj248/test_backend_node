-- AlterTable
ALTER TABLE "VideoNote" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "VideoNote_topicId_idx" ON "VideoNote"("topicId");

-- CreateIndex
CREATE INDEX "VideoNote_courseType_idx" ON "VideoNote"("courseType");
