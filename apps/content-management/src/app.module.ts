import { Module } from "@nestjs/common";
import { ContentsModule } from "./contents/contents.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule.forRoot(), ContentsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
