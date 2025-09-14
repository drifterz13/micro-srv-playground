import { Injectable } from "@nestjs/common";
import Stream, { PassThrough } from "node:stream";
import { Resolution } from "./types";
import * as ffmpeg from "fluent-ffmpeg";
import { UploaderService } from "src/uploader/uploader.service";

@Injectable()
export class TranscoderService {
  private resolutions: Resolution[] = [
    { name: "1080p", width: 1920, height: 1080, bitrate: "2000k" },
    { name: "720p", width: 1280, height: 720, bitrate: "1000k" },
    { name: "480p", width: 854, height: 480, bitrate: "500k" },
  ];

  private keyPrefix = "transcoded/";

  constructor(private uploaderSrv: UploaderService) {}

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
  }

  private async processTranscoding(
    inputUrl: string,
    resolution: Resolution,
    objectName: string,
  ): Promise<{ resolution: string; outputKey: string; etag: string }> {
    return new Promise((resolve, reject) => {
      const outputStream = new PassThrough();

      const objectKey = objectName.split(".")[0]; // Eg. 1cfd6390-4144-4a1b-a79c-411d7eff02d2.mp4
      const outputKey = `${this.keyPrefix}${objectKey}_${resolution.name}.mp4`;

      let uploadPromise: Promise<{ etag: string; versionId?: string }>;

      const cleanup = (error?: Error) => {
        if (!outputStream.destroyed) {
          outputStream.destroy(error);
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
            outputStream,
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
          outputStream.end();

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
        .pipe(outputStream, { end: false });

      outputStream.on("error", (err) => {
        cleanup(err);
        reject(err);
      });
    });
  }
}
