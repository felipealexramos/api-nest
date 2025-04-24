import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  enableShutdownHooks(app: INestApplication) {
    // Use Node.js process events for graceful shutdown
    process.on('beforeExit', () => {
      app.close().then(() => {
        this.$disconnect();
      });
    });

    // Handle termination signals
    ['SIGINT', 'SIGTERM'].forEach((signal) => {
      process.on(signal, () => {
        app.close().then(() => {
          this.$disconnect();
          process.exit(0);
        });
      });
    });
  }
}
