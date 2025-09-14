import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateMultipartUploadDto {
  @ApiProperty({
    description: 'The name of the object to upload',
    example: 'video.mp4'
  })
  @IsString()
  objectName: string;

  @ApiProperty({
    description: 'The content type of the object',
    example: 'video/mp4',
    required: false
  })
  @IsOptional()
  @IsString()
  contentType?: string;
}