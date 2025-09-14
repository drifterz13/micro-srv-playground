import { Module } from "@nestjs/common";
import { ContentsModule } from "./contents/contents.module";
import { ConfigModule } from "@nestjs/config";
import { UploadModule } from "./upload/upload.module";
import { PersistenceModule } from "./persistence/persistence.module";

@Module({
	imports: [
		ConfigModule.forRoot(),
		ContentsModule,
		UploadModule,
		PersistenceModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
