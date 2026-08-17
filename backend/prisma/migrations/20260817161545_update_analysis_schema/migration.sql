/*
  Warnings:

  - The `content` column on the `Analysis` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `externalJobId` on table `Analysis` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Analysis" DROP COLUMN "content",
ADD COLUMN     "content" JSONB,
ALTER COLUMN "externalJobId" SET NOT NULL;
