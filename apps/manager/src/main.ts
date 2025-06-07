import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ManagersModule } from './managers.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(ManagersModule);
  const configService = app.get(ConfigService)
  app.enableCors({});

  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: "0.0.0.0",
      port: configService.get("MANAGER_TCP_PORT")

    }
  })
  await app.startAllMicroservices()
  await app.listen(configService.get("MANAGER_HTTP_PORT") as string, "0.0.0.0");
  console.log(`🚀 App listening on port ${process.env.MANAGER_HTTP_PORT as string}`);
}
bootstrap();


