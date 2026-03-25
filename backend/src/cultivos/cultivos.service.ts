import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateCultivoDto } from './dto/create-cultivo.dto'
import { UpdateCultivoDto } from './dto/update-cultivo.dto'
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class CultivosService {
  constructor(private readonly prisma: PrismaService) {}

  private formatImage(cultivo: any) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
    return {
      ...cultivo,
      imagen: cultivo.imagen ? `${baseUrl}${cultivo.imagen}` : null,
    }
  }

  async findAll(userId: number) {
    const cultivos = await this.prisma.cultivo.findMany({
      where: { userId },
      include: { user: true, reportes: true },
      orderBy: { createdAt: 'desc' }
    })

    return cultivos.map(c => this.formatImage(c))
  }

  async findOne(id: number, userId: number) {
    const cultivo = await this.prisma.cultivo.findFirst({
      where: {
        id,
        userId
      },
      include: { user: true, reportes: true },
    })

    if (!cultivo) {
      throw new NotFoundException(`Cultivo no encontrado`)
    }

    return this.formatImage(cultivo)
  }

  async create(user: any, data: CreateCultivoDto & { imagen?: string }) {
    if (!user?.id) {
      throw new NotFoundException('Usuario no autenticado')
    }

    const cultivo = await this.prisma.cultivo.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        fechaSiembra: new Date(data.fechaSiembra),
        ubicacion: data.ubicacion,
        frecuenciaRiego: data.frecuenciaRiego,
        estado: data.estado ?? 'activo',
        imagen: data.imagen,
        userId: user.id
      },
      include: { user: true, reportes: true },
    })

    return this.formatImage(cultivo)
  }

  async update(
    id: number,
    userId: number,
    data: UpdateCultivoDto & { imagen?: string }
  ) {
    const cultivo = await this.prisma.cultivo.findUnique({
      where: { id }
    })

    if (!cultivo) throw new NotFoundException('Cultivo no encontrado')

    if (cultivo.userId !== userId) {
      throw new ForbiddenException('No puedes editar este cultivo')
    }

    const updateData: any = {}

    if (data.nombre !== undefined) updateData.nombre = data.nombre
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion
    if (data.fechaSiembra !== undefined) updateData.fechaSiembra = new Date(data.fechaSiembra)
    if (data.ubicacion !== undefined) updateData.ubicacion = data.ubicacion
    if (data.frecuenciaRiego !== undefined) updateData.frecuenciaRiego = data.frecuenciaRiego
    if (data.estado !== undefined) updateData.estado = data.estado
    if (data.imagen !== undefined) updateData.imagen = data.imagen

    const updated = await this.prisma.cultivo.update({
      where: { id },
      data: updateData,
      include: { user: true, reportes: true },
    })

    return this.formatImage(updated)
  }

  async remove(id: number, userId: number) {
    const cultivo = await this.prisma.cultivo.findUnique({
      where: { id }
    })

    if (!cultivo) throw new NotFoundException('Cultivo no encontrado')

    if (cultivo.userId !== userId) {
      throw new ForbiddenException('No puedes eliminar este cultivo')
    }

    if (cultivo.imagen) {
      const relativePath = cultivo.imagen.replace(
        process.env.BASE_URL || 'http://localhost:3000',
        '',
      )
      const imagePath = path.join(process.cwd(), relativePath)

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }

    return this.prisma.cultivo.delete({
      where: { id },
    })
  }
}