import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';

export class SocketUtils {
  private static readonly logger = new Logger('SocketUtils');
  static async safeEmit(
    server: Server,
    socketIds: string[],
    event: string,
    data: any,
    options?: {
      timeout?: number; // ms (default: 2000)
      debug?: boolean;
    },
  ): Promise<void> {
    if (!socketIds?.length) return;

    const { timeout = 2000, debug = false } = options || {};

    for (const socketId of socketIds) {
      try {
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(() => {
            if (debug) {
              this.logger.warn(`Emit timeout for ${socketId}`);
            }
            resolve();
          }, timeout);

          server.to(socketId).emit(event, data, (ack: any) => {
            clearTimeout(timer);
            if (debug) {
              this.logger.log(
                `Emitted to ${socketId} successfully`,
                ack ? `ACK: ${JSON.stringify(ack)}` : '',
              );
            }
            resolve();
          });
        });
      } catch (error) {
        this.logger.error(`Emit error to ${socketId}:`, error);
      }
    }
  }

  static async getSocketIds(
    redisService: any,
    namespace: string,
    userId: string,
  ): Promise<string[]> {
    try {
      return (await redisService.getUserSockets(namespace, userId)) || [];
    } catch (error) {
      this.logger.error(`Redis error for user ${userId}:`, error);
      return [];
    }
  }
}
