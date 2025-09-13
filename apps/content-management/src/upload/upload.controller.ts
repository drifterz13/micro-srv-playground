import { Controller, Get, HttpStatus, Inject, Param } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UPLOADER_TOKEN } from "./upload.contants";
import { IUploader } from "./ports/uploader.port";

@ApiTags("upload")
@Controller("upload")
export class UploadController {
  constructor(@Inject(UPLOADER_TOKEN) private uploadSrv: IUploader) {}

  @Get("presigned")
  @ApiOperation({ summary: "Get presigned url for put request" })
  @ApiResponse({ status: HttpStatus.OK })
  async getPutPresignedUrl() {
    return this.uploadSrv.getPutPresignedUrl();
  }

  @Get("presigned/:objectKey")
  @ApiOperation({ summary: "Get presigned url for get request" })
  @ApiParam({
    name: "objectKey",
    description: "The object key to download",
    required: true,
    type: String,
  })
  @ApiResponse({ status: HttpStatus.OK })
  async getDownloadPresignedUrl(@Param("objectKey") objectKey: string) {
    return this.uploadSrv.getDownloadPresignedUrl(objectKey);
  }
}
