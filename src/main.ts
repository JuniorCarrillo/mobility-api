import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .setTitle('Mobility API')
    .setDescription(
      'Documentation for Uber-like API developed in NestJS with payment gateway',
    )
    .setVersion('0.0.1')
    .setContact(
      'Junior Carrillo',
      'https://github.com/JuniorCarrillo/mobility-api/',
      'soyjrcarrillo@gmail.com',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .setLicense(
      'MIT License',
      'https://github.com/JuniorCarrillo/mobility-api/blob/master/LICENSE',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  app.enableCors();
  await app.listen(process.env.HTTP_PORT || 3000);
}
bootstrap();
