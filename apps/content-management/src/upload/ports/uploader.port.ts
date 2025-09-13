export interface IUploader {
  getPutPresignedUrl(): Promise<string>;
}
