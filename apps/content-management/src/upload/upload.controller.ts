import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiBody,
} from "@nestjs/swagger";
import { UPLOADER_TOKEN } from "./upload.contants";
import { IUploader } from "./ports/uploader.port";
import { CreateMultipartUploadDto } from "./dto/create-multipart-upload.dto";
import { CompleteMultipartUploadDto } from "./dto/complete-multipart-upload.dto";

@ApiTags("upload")
@Controller("upload")
export class UploadController {
  constructor(@Inject(UPLOADER_TOKEN) private uploadSrv: IUploader) {}

  @Get("presigned")
  @ApiOperation({ summary: "Get presigned url for put request" })
  @ApiResponse({ status: HttpStatus.OK })
  async getPutPresignedUrl() {
    return this.uploadSrv.getPresignedUrl();
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

  @Post("multipart")
  @ApiOperation({ summary: "Create a multipart upload" })
  @ApiBody({ type: CreateMultipartUploadDto })
  @ApiResponse({ status: HttpStatus.OK })
  async createMultipartUpload(@Body() dto: CreateMultipartUploadDto) {
    return this.uploadSrv.createMultipartUpload(
      dto.objectName,
      dto.contentType,
    );
  }

  @Get("multipart/presigned")
  @ApiOperation({ summary: "Get presigned url for a part in multipart upload" })
  @ApiQuery({
    name: "uploadId",
    description: "The upload ID",
    required: true,
    type: String,
  })
  @ApiQuery({
    name: "objectName",
    description: "The object name",
    required: true,
    type: String,
  })
  @ApiQuery({
    name: "part",
    description: "The part number",
    required: true,
    type: Number,
  })
  @ApiResponse({ status: HttpStatus.OK })
  async getPresignedUrlForPart(
    @Query("uploadId") uploadId: string,
    @Query("objectName") objectName: string,
    @Query("part") part: number,
  ) {
    return this.uploadSrv.getPresignedUrlForPart(uploadId, objectName, part);
  }

  @Post("multipart/complete")
  @ApiOperation({ summary: "Complete a multipart upload" })
  @ApiBody({ type: CompleteMultipartUploadDto })
  @ApiResponse({ status: HttpStatus.OK })
  async completeMultipartUpload(@Body() dto: CompleteMultipartUploadDto) {
    return this.uploadSrv.completeMultipartUpload(
      dto.uploadId,
      dto.objectName,
      dto.parts,
    );
  }
}
