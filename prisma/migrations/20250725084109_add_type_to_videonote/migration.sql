-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'other';

-- AlterTable
ALTER TABLE "VideoNote" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'other';
