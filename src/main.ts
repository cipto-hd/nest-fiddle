import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

const PORT = 3000;

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter();
  fastifyAdapter.enableCors({ origin: '*' });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(PORT, () =>
    console.log(`Nest server is listening at http://localhost:${PORT}`),
  );
}
bootstrap();
