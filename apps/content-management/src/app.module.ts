import { Module } from "@nestjs/common";
import { ContentsModule } from "./contents/contents.module";
import { ConfigModule } from "@nestjs/config";
import { UploadModule } from "./upload/upload.module";

@Module({
  imports: [ConfigModule.forRoot(), ContentsModule, UploadModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
