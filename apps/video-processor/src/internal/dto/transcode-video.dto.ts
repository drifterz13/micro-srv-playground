import { IsString } from "class-validator";

export class TranscodeVideoDto {
  @IsString()
  objectName: string;
}
