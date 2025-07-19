-- CreateIndex
CREATE INDEX "Vote_createdAt_idx" ON "Vote"("createdAt");

-- CreateIndex
CREATE INDEX "Vote_argumentId_idx" ON "Vote"("argumentId");

-- CreateIndex
CREATE INDEX "Vote_userId_idx" ON "Vote"("userId");
