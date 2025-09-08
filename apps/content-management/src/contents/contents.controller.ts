import { Controller, Get } from "@nestjs/common";

@Controller("contents")
export class ContentsController {
  @Get()
  async getContents() {
    return "This is contents";
  }

  @Get("/test")
  async getTestContents() {
    return "This is test contents";
  }
}
