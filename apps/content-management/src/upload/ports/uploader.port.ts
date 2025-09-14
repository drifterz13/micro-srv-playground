export interface IUploader {
  getPresignedUrl(): Promise<string>;
  getDownloadPresignedUrl(objectKey: string): Promise<string>;
  createMultipartUpload(
    objectName: string,
    contentType?: string,
  ): Promise<{ uploadId: string; objectName: string }>;
  getPresignedUrlForPart(
    uploadId: string,
    objectName: string,
    part: number,
  ): Promise<string>;
  completeMultipartUpload(
    uploadId: string,
    objectName: string,
    parts: { partNumber: number; etag: string }[],
  ): Promise<{ etag: string; versionId: string }>;
}
