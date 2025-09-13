import { Inject, Injectable } from "@nestjs/common";
import { IUploader } from "./ports/uploader.port";
import { MINIO_CLIENT_TOKEN } from "./uploads.contants";
import { Client as MinioClient } from "minio";
import uploadsConfig from "src/configs/uploads.config";
import { ConfigType } from "@nestjs/config";

@Injectable()
export class UploadsService implements IUploader {
  constructor(
    @Inject(MINIO_CLIENT_TOKEN)
    private minioClient: MinioClient,

    @Inject(uploadsConfig.KEY)
    private uploadConfig: ConfigType<typeof uploadsConfig>,
  ) {}

  async getPutPresignedUrl(): Promise<string> {
    const presignedUrl = await this.minioClient.presignedPutObject(
      this.uploadConfig.minioBucketName,
      crypto.randomUUID(),
      600, // 600s or 10m
    );

    return presignedUrl;
  }
}
