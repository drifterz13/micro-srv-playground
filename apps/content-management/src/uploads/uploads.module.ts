import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigType } from "@nestjs/config";
import uploadsConfig from "src/configs/uploads.config";
import * as Minio from "minio";
import { MINIO_CLIENT_TOKEN, UPLOADER_TOKEN } from "./uploads.contants";
import { UploadsService } from "./uploads.service";

@Global()
@Module({
  imports: [ConfigModule.forFeature(uploadsConfig)],
  controllers: [],
  providers: [
    {
      provide: MINIO_CLIENT_TOKEN,
      inject: [uploadsConfig.KEY],
      useFactory: (config: ConfigType<typeof uploadsConfig>) => {
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
      useClass: UploadsService,
    },
  ],
  exports: [UPLOADER_TOKEN],
})
export class UploadsModule {}
