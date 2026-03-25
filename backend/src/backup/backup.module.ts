import { Module } from '@nestjs/common';
import { BackupController } from './backup.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [BackupController],
  providers: [PrismaService],
})
export class BackupModule {}
