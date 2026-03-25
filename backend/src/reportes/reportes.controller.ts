import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  Res,
  UseGuards,
  Request,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Express, Response } from "express";
import { ReportesService } from "./reportes.service";
import { CreateReporteDto } from "./dto/create-reporte.dto";
import { UpdateReporteDto } from "./dto/update-reporte.dto";
import { multerConfig } from "./upload.config";
import * as path from "path";
import * as fs from "fs";
import sharp from "sharp";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("reportes")
@UseGuards(JwtAuthGuard)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Post()
  @UseInterceptors(FileInterceptor("imagen", multerConfig))
  async create(
    @Request() req,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File
  ) {
    let imagen: string | null = null;

    if (file) {
      const ext = path.extname(file.originalname).toLowerCase();
      const baseName = path.basename(file.filename, ext);
      const filename = `${baseName}-processed.png`;
      const outputPath = path.join(process.cwd(), "uploads", filename);

      await sharp(file.path).png().toFile(outputPath);
      fs.unlink(file.path, () => null);

      imagen = filename;
    }

    const dto: CreateReporteDto = {
      titulo: body.titulo,
      descripcion: body.descripcion,
      tipo: body.tipo,
      cultivoId: Number(body.cultivoId),
    };

    return this.reportesService.create(dto, imagen, req.user.id);
  }

  @Get("cultivo/:id")
  findByCultivo(
    @Param("id", ParseIntPipe) cultivoId: number,
    @Request() req
  ) {
    return this.reportesService.findByCultivo(cultivoId, req.user.id);
  }

  @Get("list")
  findAll(@Request() req) {
    return this.reportesService.findAll(req.user.id);
  }

  @Get("kpis")
  getKpis(@Request() req) {
    return this.reportesService.getKpis(req.user.id);
  }

  @Get("chart")
  getChart(@Request() req) {
    return this.reportesService.getChart(req.user.id);
  }

  @Post("generar")
  generarReporte(@Request() req) {
    return this.reportesService.generarReporte(req.user.id);
  }

  @Get(":id/descargar")
  async descargarReporte(
    @Param("id", ParseIntPipe) id: number,
    @Request() req,
    @Res() res: Response
  ) {
    try {
      const fileBuffer = await this.reportesService.generarPdf(id, req.user.id);

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=reporte-${id}.pdf`,
        "Content-Length": fileBuffer.length,
      });

      res.end(fileBuffer);
    } catch {
      res.status(500).send("Error al generar o descargar el reporte");
    }
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateReporteDto,
    @Request() req
  ) {
    return this.reportesService.update(id, dto, req.user.id);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number, @Request() req) {
    return this.reportesService.remove(id, req.user.id);
  }
}