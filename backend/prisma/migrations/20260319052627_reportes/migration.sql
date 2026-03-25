-- AlterTable
ALTER TABLE "Reporte" ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
