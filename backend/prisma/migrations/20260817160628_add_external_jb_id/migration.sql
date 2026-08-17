-- AlterTable
ALTER TABLE "Analysis" ADD COLUMN     "externalJobId" TEXT,
ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'processing';
