import { Body, Controller, Get, HttpStatus, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateContentDto } from "./dto/create-content-request.dto";
import { ContentsService } from "./contents.service";

@ApiTags("contents")
@Controller("contents")
export class ContentsController {
  constructor(private contentSrv: ContentsService) {}

  @Get()
  @ApiOperation({ summary: "Get all contents" })
  @ApiResponse({ status: HttpStatus.OK })
  async getContents() {
    return "This is contents";
  }

  @Post()
  @ApiOperation({ summary: "Create a content" })
  @ApiBody({ type: CreateContentDto })
  @ApiResponse({ status: HttpStatus.CREATED })
  async createContent(@Body() createContentDto: CreateContentDto) {
    const { key, contentType } = createContentDto;

    return this.contentSrv.createContent({ key, contentType });
  }
}
