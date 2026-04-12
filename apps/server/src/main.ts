import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { config } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
  });

  if (config.apiPrefix) {
    app.setGlobalPrefix(config.apiPrefix);
  }

  await app.listen(config.port);

  const url = await app.getUrl();
  Logger.log(
    `Listening on ${url}${config.apiPrefix || ''}`,
    'WetlandShieldServer',
  );
}

void bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  Logger.error(message, 'WetlandShieldServer');
  process.exitCode = 1;
});
