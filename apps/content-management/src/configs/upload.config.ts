import { IsNumberString, IsString, validateSync } from "class-validator";
import { registerAs } from "@nestjs/config";
import { plainToInstance } from "class-transformer";

class UploadConfig {
  @IsString()
  minioAccessKey: string;

  @IsString()
  minioSecretKey: string;

  @IsString()
  minioEndpoint: string;

  @IsNumberString()
  minioPort: number;

  @IsString()
  minioBucketName: string;
}

const UPLOAD_CONFIG_TOKEN = "UPLOAD_CONFIG_TOKEN";

export default registerAs(UPLOAD_CONFIG_TOKEN, async () => {
  const config = plainToInstance(UploadConfig, {
    minioAccessKey: process.env.MINIO_ACCESS_KEY,
    minioSecretKey: process.env.MINIO_SECRET_KEY,
    minioEndpoint: process.env.MINIO_ENDPOINT,
    minioPort: process.env.MINIO_PORT,
    minioBucketName: process.env.MINIO_BUCKET_NAME,
  });

  const errs = validateSync(config);
  if (errs.length > 0) {
    throw new Error(errs.toString());
  }

  return config;
});
