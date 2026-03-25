import { Controller, Get, UseGuards, Res } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('backup')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class BackupController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getFullBackup() {
    // Extraemos todo lo relevante para un respaldo total
    const [usuarios, cultivos, reportes] = await Promise.all([
      this.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          farmName: true,
          location: true,
          language: true,
          createdAt: true,
        }
      }),
      this.prisma.cultivo.findMany(),
      this.prisma.reporte.findMany(),
    ]);

    return {
      version: "1.0",
      timestamp: new Date().toISOString(),
      huerto: usuarios.find(u => u.role === 'admin')?.farmName || "Tetlalli",
      data: {
        usuarios,
        cultivos,
        reportes // Las bitácoras
      }
    };
  }
}
