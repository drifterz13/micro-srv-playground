import { Module } from "@nestjs/common";
import { ContentsController } from "./contents.controller";
import { ContentsService } from "./contents.service";
import { KafkaModule } from "../kafka/kafka.module";

@Module({
  imports: [KafkaModule],
  controllers: [ContentsController],
  providers: [ContentsService],
})
export class ContentsModule {}
