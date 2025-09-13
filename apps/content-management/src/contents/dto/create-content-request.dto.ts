import { IsIn, IsString } from "class-validator";

export class CreateContentDto {
  @IsIn(["image", "video", "file"])
  contentType: string;

  @IsString()
  key: string;
}
