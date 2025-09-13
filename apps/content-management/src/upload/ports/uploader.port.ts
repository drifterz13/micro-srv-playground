export interface IUploader {
  getPutPresignedUrl(): Promise<string>;
  getDownloadPresignedUrl(objectKey: string): Promise<string>;
}
