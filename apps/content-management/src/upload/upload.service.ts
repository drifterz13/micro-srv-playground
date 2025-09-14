import { Inject, Injectable } from "@nestjs/common";
import { IUploader } from "./ports/uploader.port";
import { MINIO_CLIENT_TOKEN } from "./upload.contants";
import { Client as MinioClient } from "minio";
import uploadConfig from "src/configs/upload.config";
import { ConfigType } from "@nestjs/config";

@Injectable()
export class UploadService implements IUploader {
  constructor(
    @Inject(MINIO_CLIENT_TOKEN)
    private minioClient: MinioClient,

    @Inject(uploadConfig.KEY)
    private config: ConfigType<typeof uploadConfig>,
  ) {}

  private get defaultPresignedUrlTTL() {
    return 600; // 600s or 10m
  }

  async getPutPresignedUrl(): Promise<string> {
    const presignedUrl = await this.minioClient.presignedPutObject(
      this.config.minioBucketName,
      crypto.randomUUID(),
      this.defaultPresignedUrlTTL,
    );

    return presignedUrl;
  }

  async getDownloadPresignedUrl(objectKey: string): Promise<string> {
    const presignedUrl = await this.minioClient.presignedGetObject(
      this.config.minioBucketName,
      objectKey,
      this.defaultPresignedUrlTTL,
    );

    return presignedUrl;
  }
}
