import { Inject, Injectable } from "@nestjs/common";
import { IUploader } from "src/uploads/ports/uploader.port";
import { UPLOADER_TOKEN } from "src/uploads/uploads.contants";

@Injectable()
export class ContentsService {
  constructor(@Inject(UPLOADER_TOKEN) private uploader: IUploader) {}

  async getUploadContentUrl() {
    return this.uploader.getPutPresignedUrl();
  }
}
