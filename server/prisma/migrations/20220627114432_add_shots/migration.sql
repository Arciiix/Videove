-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_id_fkey";

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_id_fkey" FOREIGN KEY ("id") REFERENCES "Shots"("projectId") ON DELETE CASCADE ON UPDATE CASCADE;
