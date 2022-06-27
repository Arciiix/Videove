/*
  Warnings:

  - You are about to drop the column `projectId` on the `Shots` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shotsId]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shotsId` to the `Project` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Shots` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_id_fkey";

-- DropIndex
DROP INDEX "Shots_projectId_key";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "shotsId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Shots" DROP COLUMN "projectId",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Shots_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Project_shotsId_key" ON "Project"("shotsId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_shotsId_fkey" FOREIGN KEY ("shotsId") REFERENCES "Shots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
