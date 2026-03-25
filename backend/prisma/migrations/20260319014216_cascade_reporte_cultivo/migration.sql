-- DropForeignKey
ALTER TABLE "Reporte" DROP CONSTRAINT "Reporte_cultivoId_fkey";

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_cultivoId_fkey" FOREIGN KEY ("cultivoId") REFERENCES "Cultivo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
