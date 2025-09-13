import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("contents")
@Controller("contents")
export class ContentsController {
  @Get()
  @ApiOperation({ summary: "Get all contents" })
  @ApiResponse({ status: 200 })
  async getContents() {
    return "This is contents";
  }
}
