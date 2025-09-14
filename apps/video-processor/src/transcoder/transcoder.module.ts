import { Global, Module } from "@nestjs/common";
import { UploaderModule } from "src/uploader/uploader.module";
import { TranscoderService } from "./transcoder.service";

@Global()
@Module({
  imports: [UploaderModule],
  providers: [TranscoderService],
  exports: [TranscoderService],
})
export class TranscoderModule {}
