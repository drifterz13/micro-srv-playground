import { Body, Controller, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { TranscoderService } from "src/transcoder/transcoder.service";
import { TranscodeVideoDto } from "./dto/transcode-video.dto";

@ApiTags("internal")
@Controller("internal")
export class InternalController {
  constructor(private transcoderSrv: TranscoderService) {}

  @ApiOperation({ summary: "Transcode a video" })
  @ApiBody({ type: TranscodeVideoDto })
  @Post("transcode")
  async transcodeVideo(@Body() dto: TranscodeVideoDto) {
    return this.transcoderSrv.transcode(dto.objectName);
  }
}
