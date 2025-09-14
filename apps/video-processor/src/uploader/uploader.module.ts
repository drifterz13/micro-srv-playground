import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigType } from "@nestjs/config";
import uploadConfig from "./uploader.config";
import * as Minio from "minio";
import { MINIO_CLIENT_TOKEN } from "./uploader.constant";
import { UploaderService } from "./uploader.service";

@Global()
@Module({
  imports: [ConfigModule.forFeature(uploadConfig)],
  controllers: [],
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
    UploaderService,
  ],
  exports: [UploaderService],
})
export class UploaderModule {}
