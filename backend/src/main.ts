import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    stopAtFirstError: true,
  }),
);
  

  app.setGlobalPrefix('api')

  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  })

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  })

  const port = process.env.PORT || 3000
  await app.listen(port)

  console.log(`🚀 Server running on port ${port}`)
}
bootstrap()