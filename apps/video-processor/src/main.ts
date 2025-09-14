import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const config = new DocumentBuilder()
		.setTitle("Video Transcoder API")
		.setDescription("The video transcoder API description")
		.setVersion("1.0")
		.addTag("videos")
		.build();

	const documentFactory = () => SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("videos/api", app, documentFactory);

	app.useGlobalPipes(new ValidationPipe());

	await app.listen(process.env.PORT || 7000);
}
bootstrap();
