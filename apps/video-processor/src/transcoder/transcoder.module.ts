import { Global, Module } from "@nestjs/common";
import { UploaderModule } from "src/uploader/uploader.module";
import { TranscoderService } from "./transcoder.service";
import { KafkaModule } from "src/kafka/kafka.module";

@Global()
@Module({
  imports: [UploaderModule, KafkaModule],
  providers: [TranscoderService],
  exports: [TranscoderService],
})
export class TranscoderModule {}
