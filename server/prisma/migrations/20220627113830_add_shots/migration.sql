-- CreateTable
CREATE TABLE "Shots" (
    "projectId" TEXT NOT NULL,
    "data" JSONB NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Shots_projectId_key" ON "Shots"("projectId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_id_fkey" FOREIGN KEY ("id") REFERENCES "Shots"("projectId") ON DELETE RESTRICT ON UPDATE CASCADE;
