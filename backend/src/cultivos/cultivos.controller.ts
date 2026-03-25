import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { CultivosService } from './cultivos.service'
import { CreateCultivoDto } from './dto/create-cultivo.dto'
import { UpdateCultivoDto } from './dto/update-cultivo.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + extname(file.originalname))
  },
})

@Controller('cultivos')
@UseGuards(JwtAuthGuard)
export class CultivosController {
  constructor(private readonly cultivosService: CultivosService) {}

  @Get()
  findAll(@Request() req) {
    return this.cultivosService.findAll(req.user.id)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.cultivosService.findOne(Number(id), req.user.id)
  }

  @Post()
  @UseInterceptors(FileInterceptor('imagen', { storage }))
  create(
    @Request() req,
    @Body() body: CreateCultivoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      body.imagen = `/uploads/${file.filename}`
    }

    return this.cultivosService.create(req.user, body)
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('imagen', { storage }))
  update(
    @Request() req,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateCultivoDto,
  ) {
    return this.cultivosService.update(
      Number(id),
      req.user.id,
      {
        ...dto,
        imagen: file ? `/uploads/${file.filename}` : dto.imagen,
      }
    )
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.cultivosService.remove(Number(id), req.user.id)
  }
}