import { registerAs } from '@nestjs/config';

export default registerAs('kafka', () => ({
  clientId: 'video-processor',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:9094'],
  connectionTimeout: 3000,
  requestTimeout: 30000,
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
}));