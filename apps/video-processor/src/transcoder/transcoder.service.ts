import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import Stream, { PassThrough } from "node:stream";
import { Resolution } from "./types";
import * as ffmpeg from "fluent-ffmpeg";
import { UploaderService } from "src/uploader/uploader.service";
import { KafkaService } from "src/kafka/kafka.service";

@Injectable()
export class TranscoderService implements OnModuleInit {
  private readonly logger = new Logger(KafkaService.name);

  private resolutions: Resolution[] = [
    { name: "1080p", width: 1920, height: 1080, bitrate: "2000k" },
    { name: "720p", width: 1280, height: 720, bitrate: "1000k" },
    { name: "480p", width: 854, height: 480, bitrate: "500k" },
  ];

  private keyPrefix = "transcoded/";

  constructor(
    private uploaderSrv: UploaderService,
    private kafkaSrv: KafkaService,
  ) {}

  async onModuleInit() {
    await this.subscribeToVideoRequests();
  }

  private async subscribeToVideoRequests() {
    await this.kafkaSrv.subscribe(
      "video.processing.requests",
      async (message) => {
        try {
          const request = JSON.parse(message.value?.toString() || "{}");
          this.logger.log(
            `Processing video request for content ID: ${request.contentId}`,
            request,
          );

          if (!request.metadata.objectKey) {
            this.logger.error("Invalid request: missing objectKey");
            return;
          }

          await this.transcode(request.metadata.objectKey);
        } catch (error) {
          this.logger.error("Error processing video request", error);
        }
      },
    );
  }

  private async sendVideoProcessingComplete(objectKey: string, result: any) {
    const message = {
      objectKey,
      result,
      completedAt: new Date().toISOString(),
      completedBy: "video-processor",
    };

    await this.kafkaSrv.sendMessage(
      "video.processing.completed",
      message,
      objectKey,
    );
  }

  async transcode(objectName: string) {
    console.log(
      `Starting transcoding for ${objectName} into ${this.resolutions.length} resolutions`,
    );

    const transcodingPromises = this.resolutions.map(async (resolution) => {
      try {
        // Use presigned URL instead of stream to avoid pipe compatibility issues
        const inputUrl = await this.uploaderSrv.getPresignedUrl(objectName);
        const result = await this.processTranscoding(
          inputUrl,
          resolution,
          objectName,
        );

        console.log(
          `${objectName} - ${resolution.name} uploaded successfully with etag: ${result.etag}`,
        );

        return result;
      } catch (error) {
        console.error(
          `Failed to transcode ${objectName} to ${resolution.name}:`,
          error,
        );
        return {
          resolution: resolution.name,
          outputKey: `${this.keyPrefix}${objectName}_${resolution.name}.mp4`,
          etag: null,
          error: error.message,
        };
      }
    });

    await Promise.allSettled(transcodingPromises);

    await this.sendVideoProcessingComplete(objectName, {
      status: "completed",
      processedAt: new Date().toISOString(),
    });
  }

  private async processTranscoding(
    inputUrl: string,
    resolution: Resolution,
    objectName: string,
  ): Promise<{ resolution: string; outputKey: string; etag: string }> {
    return new Promise((resolve, reject) => {
      const passThroughStream = new PassThrough();

      const objectKey = objectName.split(".")[0]; // Eg. 1cfd6390-4144-4a1b-a79c-411d7eff02d2.mp4
      const outputKey = `${this.keyPrefix}${objectKey}_${resolution.name}.mp4`;

      let uploadPromise: Promise<{ etag: string; versionId?: string }>;

      const cleanup = (error?: Error) => {
        if (!passThroughStream.destroyed) {
          passThroughStream.destroy(error);
        }
      };

      ffmpeg()
        .input(inputUrl)
        .videoCodec("libx264")
        .audioCodec("aac")
        .videoBitrate(resolution.bitrate)
        .audioBitrate("128k")
        .audioChannels(2)
        .audioFrequency(44100)
        .size(`${resolution.width}x${resolution.height}`)
        .format("mp4")
        .outputOptions([
          "-preset medium",
          "-crf 23",
          "-movflags +frag_keyframe+empty_moov",
          "-avoid_negative_ts make_zero",
          "-pix_fmt yuv420p",
        ])
        .on("start", (commandLine: string) => {
          console.log(`${resolution.name} started: ${commandLine}`);
          uploadPromise = this.uploaderSrv.putObject(
            outputKey,
            passThroughStream,
            "video/mp4",
          );
        })
        .on("progress", (progress) => {
          console.log(
            `${resolution.name} progress: ${Math.round(progress.percent || 0)}%`,
          );
        })
        .on("error", (err: Error) => {
          cleanup(err);
          reject(err);
        })
        .on("end", async () => {
          passThroughStream.end();

          try {
            const { etag } = await uploadPromise;
            console.log(
              `${resolution.name} upload completed with etag: ${etag}`,
            );
            resolve({
              resolution: resolution.name,
              outputKey: outputKey,
              etag: etag,
            });
          } catch (uploadErr) {
            cleanup();
            reject(uploadErr);
          }
        })
        .pipe(passThroughStream, { end: false });

      passThroughStream.on("error", (err) => {
        cleanup(err);
        reject(err);
      });
    });
  }
}
