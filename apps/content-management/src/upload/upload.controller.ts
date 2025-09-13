import { Controller, Get, Inject } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UPLOADER_TOKEN } from "./upload.contants";
import { IUploader } from "./ports/uploader.port";

@ApiTags("upload")
@Controller("upload")
export class UploadController {
  constructor(@Inject(UPLOADER_TOKEN) private uploadSrv: IUploader) {}

  @Get("presigned")
  @ApiOperation({ summary: "Get presigned url for put request" })
  @ApiResponse({ status: 200 })
  async getPutPresignedUrl() {
    return this.uploadSrv.getPutPresignedUrl();
  }
}
