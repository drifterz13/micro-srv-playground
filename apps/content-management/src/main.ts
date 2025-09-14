import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: ["log", "warn", "error"],
	});
	app.enableCors({
		origin: "http://localhost:3000",
	});

	const config = new DocumentBuilder()
		.setTitle("Content Management API")
		.setDescription("The contents API description")
		.setVersion("1.0")
		.addTag("contents")
		.build();

	const documentFactory = () => SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("contents/api", app, documentFactory);

	app.useGlobalPipes(new ValidationPipe());

	await app.listen(process.env.PORT || 4000);
}
bootstrap();
