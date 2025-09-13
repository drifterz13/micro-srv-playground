import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigType } from "@nestjs/config";
import uploadConfig from "src/configs/upload.config";
import * as Minio from "minio";
import { MINIO_CLIENT_TOKEN, UPLOADER_TOKEN } from "./upload.contants";
import { UploadService } from "./upload.service";
import { UploadController } from "./upload.controller";

@Global()
@Module({
  imports: [ConfigModule.forFeature(uploadConfig)],
  controllers: [UploadController],
  providers: [
    {
      provide: MINIO_CLIENT_TOKEN,
      inject: [uploadConfig.KEY],
      useFactory: (config: ConfigType<typeof uploadConfig>) => {
        const minioClient = new Minio.Client({
          endPoint: config.minioEndpoint,
          port: config.minioPort,
          useSSL: false,
          accessKey: config.minioAccessKey,
          secretKey: config.minioSecretKey,
        });

        return minioClient;
      },
    },
    {
      provide: UPLOADER_TOKEN,
      useClass: UploadService,
    },
  ],
  exports: [UPLOADER_TOKEN],
})
export class UploadModule {}
