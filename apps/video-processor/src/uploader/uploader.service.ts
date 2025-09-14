import { Inject, Injectable } from "@nestjs/common";
import { MINIO_CLIENT_TOKEN } from "./uploader.constant";
import { Client as MinioClient } from "minio";
import uploaderConfig from "./uploader.config";
import { ConfigType } from "@nestjs/config";
import Stream from "node:stream";

@Injectable()
export class UploaderService {
  constructor(
    @Inject(MINIO_CLIENT_TOKEN)
    private minioClient: MinioClient,

    @Inject(uploaderConfig.KEY)
    private config: ConfigType<typeof uploaderConfig>,
  ) {}

  async getObject(objectKey: string): Promise<Stream.Readable> {
    return this.minioClient.getObject(this.config.minioBucketName, objectKey);
  }

  async putObject(
    objectKey: string,
    stream: Stream.Readable,
    contentType?: string,
  ): Promise<{ etag: string; versionId?: string }> {
    // For streaming uploads (like transcoded content), we don't know the size beforehand
    // Minio can handle uploads without specifying the size
    const uploadInfo = await this.minioClient.putObject(
      this.config.minioBucketName,
      objectKey,
      stream,
      undefined, // Size unknown for streaming content
      contentType ? { "Content-Type": contentType } : {},
    );

    return { etag: uploadInfo.etag, versionId: uploadInfo.versionId };
  }

  async getObjectStats(
    objectName: string,
  ): Promise<{ size: number; etag: string }> {
    return this.minioClient.statObject(this.config.minioBucketName, objectName);
  }

  async getPresignedUrl(objectName: string): Promise<string> {
    // Generate presigned URL for GET access (valid for 1 hour)
    return this.minioClient.presignedGetObject(
      this.config.minioBucketName,
      objectName,
      60 * 60 // 1 hour
    );
  }
}
