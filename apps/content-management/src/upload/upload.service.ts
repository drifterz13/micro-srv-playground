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

  async getPresignedUrl(): Promise<string> {
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

  async createMultipartUpload(
    objectName: string,
    contentType?: string,
  ): Promise<{ uploadId: string; objectName: string }> {
    const uploadId = await this.minioClient.initiateNewMultipartUpload(
      this.config.minioBucketName,
      objectName,
      contentType ? { "Content-Type": contentType } : {},
    );

    return {
      uploadId,
      objectName,
    };
  }

  async getPresignedUrlForPart(
    uploadId: string,
    objectName: string,
    part: number,
  ): Promise<string> {
    const presignedUrl = await this.minioClient.presignedUrl(
      "PUT",
      this.config.minioBucketName,
      objectName,
      this.defaultPresignedUrlTTL,
      {
        uploadId: uploadId,
        partNumber: String(part),
      },
    );

    return presignedUrl;
  }

  async completeMultipartUpload(
    uploadId: string,
    objectName: string,
    parts: { partNumber: number; etag: string }[],
  ): ReturnType<IUploader["completeMultipartUpload"]> {
    if (!parts || parts.length === 0) {
      throw new Error("No parts provided");
    }

    const sortedParts = parts
      .sort((a, b) => a.partNumber - b.partNumber)
      .map((part) => ({
        part: part.partNumber,
        etag: part.etag,
      }));

    return this.minioClient.completeMultipartUpload(
      this.config.minioBucketName,
      objectName,
      uploadId,
      sortedParts,
    );
  }
}
