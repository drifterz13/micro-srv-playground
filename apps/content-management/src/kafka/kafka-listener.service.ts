import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaService } from './kafka.service';

@Injectable()
export class KafkaListenerService implements OnModuleInit {
  private readonly logger = new Logger(KafkaListenerService.name);

  constructor(private kafkaService: KafkaService) {}

  async onModuleInit() {
    await this.setupListeners();
  }

  private async setupListeners() {
    // Listen for video processing completion
    await this.kafkaService.subscribe('video.processing.completed', async (message) => {
      try {
        const completion = JSON.parse(message.value?.toString() || '{}');
        this.logger.log(`Video processing completed for video ID: ${completion.videoId}`);

        // Here you could update the content status in the database
        // For example: mark as processed, update metadata, etc.
        this.logger.log(`Processing result: ${JSON.stringify(completion.result)}`);

        // You could also emit events to websockets for real-time updates
        // or send notifications to users
      } catch (error) {
        this.logger.error('Error handling video processing completion', error);
      }
    });
  }
}