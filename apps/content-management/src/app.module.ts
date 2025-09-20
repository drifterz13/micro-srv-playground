import { Module } from "@nestjs/common";
import { ContentsModule } from "./contents/contents.module";
import { ConfigModule } from "@nestjs/config";
import { UploadModule } from "./upload/upload.module";
import { PersistenceModule } from "./persistence/persistence.module";
import { KafkaModule } from "./kafka/kafka.module";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		ContentsModule,
		UploadModule,
		PersistenceModule,
		KafkaModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
