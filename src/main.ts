import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'process';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

const PORT = process.env.PORT || 8000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  await app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
  });
}
bootstrap();
