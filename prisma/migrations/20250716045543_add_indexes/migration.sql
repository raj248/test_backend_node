-- CreateIndex
CREATE INDEX "Course_name_idx" ON "Course"("name");

-- CreateIndex
CREATE INDEX "Course_courseType_idx" ON "Course"("courseType");

-- CreateIndex
CREATE INDEX "MCQ_topicId_idx" ON "MCQ"("topicId");

-- CreateIndex
CREATE INDEX "MCQ_testPaperNumber_idx" ON "MCQ"("testPaperNumber");

-- CreateIndex
CREATE INDEX "Topic_courseId_idx" ON "Topic"("courseId");

-- CreateIndex
CREATE INDEX "Topic_name_idx" ON "Topic"("name");

-- CreateIndex
CREATE INDEX "Trash_tableName_idx" ON "Trash"("tableName");

-- CreateIndex
CREATE INDEX "Trash_entityId_idx" ON "Trash"("entityId");

-- CreateIndex
CREATE INDEX "Trash_trashedAt_idx" ON "Trash"("trashedAt");
