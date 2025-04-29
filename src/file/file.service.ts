import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class FileService {
  async saveUserPhoto(userId: string, photoBuffer: Buffer): Promise<string> {
    const filePath = join(
      __dirname,
      '..',
      '..',
      'storage',
      'photos',
      `photo-${userId}.png`,
    );
    await fs.writeFile(filePath, photoBuffer);
    return filePath;
  }
}
