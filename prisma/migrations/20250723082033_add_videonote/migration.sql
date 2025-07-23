-- CreateTable
CREATE TABLE "VideoNote" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "courseType" "CourseType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoNote_pkey" PRIMARY KEY ("id")
);
