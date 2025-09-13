import { Module } from "@nestjs/common";
import { ContentsController } from "./contents.controller";
import { ContentsService } from "./contents.service";
import { UploadsModule } from "src/uploads/uploads.module";

@Module({
  imports: [UploadsModule],
  controllers: [ContentsController],
  providers: [ContentsService],
})
export class ContentsModule {}
