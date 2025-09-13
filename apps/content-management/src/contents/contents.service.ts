import { Injectable } from "@nestjs/common";
import { ContentType } from "generated/prisma";
import { PrismaService } from "src/persistence/prisma.service";

@Injectable()
export class ContentsService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.content.create({
      data: {
        key: params.key,
        contentType,
      },
    });
  }

  async getAllContents() {
    return this.prisma.content.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
