import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class PartDto {
  @ApiProperty({
    description: 'The part number',
    example: 1
  })
  @IsNumber()
  partNumber: number;

  @ApiProperty({
    description: 'The ETag returned from the part upload',
    example: 'd41d8cd98f00b204e9800998ecf8427e'
  })
  @IsString()
  etag: string;
}

export class CompleteMultipartUploadDto {
  @ApiProperty({
    description: 'The upload ID returned from create multipart upload',
    example: 'abc123-def456-789'
  })
  @IsString()
  uploadId: string;

  @ApiProperty({
    description: 'The name of the object being uploaded',
    example: 'video.mp4'
  })
  @IsString()
  objectName: string;

  @ApiProperty({
    description: 'Array of completed parts with their ETags',
    type: [PartDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartDto)
  parts: PartDto[];
}