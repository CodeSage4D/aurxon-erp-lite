import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { PrismaService } from './01_Core/prisma/prisma.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { WinstonLogger } from './common/logger/winston.logger';
import * as Sentry from '@sentry/node';

async function bootstrap() {
  // Validate Encryption Key at application startup
  const encryptionKey = process.env.BACKEND_ENCRYPTION_KEY;
  if (!encryptionKey) {
    console.error('CRITICAL ERROR: BACKEND_ENCRYPTION_KEY is not defined in the environment variables!');
    process.exit(1);
  }
  const keyLength = Buffer.from(encryptionKey, 'utf8').length;
  if (keyLength !== 32) {
    console.error(`CRITICAL ERROR: BACKEND_ENCRYPTION_KEY must be exactly 32 bytes (256-bit). Provided length: ${keyLength} bytes.`);
    process.exit(1);
  }

  // Initialize Sentry SDK
  Sentry.init({
    dsn: process.env.SENTRY_DSN || '',
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
  });

  const app = await NestFactory.create(AppModule, {
    logger: new WinstonLogger(),
  });

  // Enable Security Headers via Helmet
  app.use(helmet());

  // Enable CORS
  app.enableCors();

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Register global HttpExceptionFilter with injected PrismaService
  const prisma = app.get(PrismaService);
  app.useGlobalFilters(new HttpExceptionFilter(prisma));

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`Backend server successfully listening on http://localhost:${port}`);
}
bootstrap();
