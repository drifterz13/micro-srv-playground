import { Module } from "@nestjs/common";
import { TranscoderModule } from "src/transcoder/transcoder.module";
import { InternalController } from "./internal.controller";

@Module({
  imports: [TranscoderModule],
  controllers: [InternalController],
  providers: [],
})
export class InternalModule {}
