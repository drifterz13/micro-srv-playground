import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ContentsService } from "./contents.service";

@ApiTags("contents")
@Controller("contents")
export class ContentsController {
  constructor(private contentServcie: ContentsService) {}

  @Get()
  @ApiOperation({ summary: "Get all contents" })
  @ApiResponse({ status: 200 })
  async getContents() {
    return "This is contents";
  }

  @Get("upload/presigned")
  @ApiOperation({ summary: "Get presigned url for upload content" })
  @ApiResponse({ status: 200 })
  async getContentUploadPresiendUrl() {
    return this.contentServcie.getUploadContentUrl();
  }

  @Get("test")
  @ApiOperation({ summary: "Get a test content" })
  @ApiResponse({ status: 200 })
  async testContents() {
    return "This is a test content";
  }
}
