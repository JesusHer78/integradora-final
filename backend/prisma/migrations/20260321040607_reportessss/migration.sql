/*
  Warnings:

  - Made the column `userId` on table `Reporte` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Reporte" DROP CONSTRAINT "Reporte_userId_fkey";

-- AlterTable
ALTER TABLE "Reporte" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
