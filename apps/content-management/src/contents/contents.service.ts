import { Injectable, Logger } from "@nestjs/common";
import { ContentType } from "generated/prisma";
import { PrismaService } from "src/persistence/prisma.service";
import { KafkaService } from "../kafka/kafka.service";

@Injectable()
export class ContentsService {
  private readonly logger = new Logger(ContentsService.name);

  constructor(
    private prisma: PrismaService,
    private kafkaSrv: KafkaService,
  ) {}

  private async requestVideoProcessing(contentId: string, videoMetadata: any) {
    const message = {
      contentId,
      metadata: videoMetadata,
      requestedAt: new Date().toISOString(),
      requestedBy: "content-management",
    };

    await this.kafkaSrv.sendMessage(
      "video.processing.requests",
      message,
      contentId,
    );
  }

  async createContent(params: { key: string; contentType: string }) {
    const contentType = (() => {
      switch (params.contentType) {
        case "image":
          return ContentType.Image;
        case "video":
          return ContentType.Video;
        case "pdf":
          return ContentType.Pdf;
        default:
          throw new Error("Invalid content type");
      }
    })();

    const content = await this.prisma.content.create({
      data: {
        key: params.key,
        contentType,
      },
    });

    if (contentType === ContentType.Video) {
      try {
        await this.requestVideoProcessing(String(content.id), {
          objectKey: content.key,
          contentType: content.contentType,
          createdAt: content.createdAt,
        });
        this.logger.log(
          `Video processing request sent for content ID: ${content.id}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send video processing request for content ID: ${content.id}`,
          error,
        );
      }
    }

    return content;
  }

  async getAllContents() {
    return this.prisma.content.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
