import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class FileService {
  async upload(userId: string, photoBuffer: Buffer): Promise<string> {
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

  async uploadFiles(
    userId: string,
    files: Express.Multer.File[],
  ): Promise<string[]> {
    const filePaths = await Promise.all(
      files.map(async (file) => {
        const filePath = join(
          __dirname,
          '..',
          '..',
          'storage',
          'files',
          `file-${userId}-${file.originalname}`,
        );
        await fs.writeFile(filePath, file.buffer);
        return filePath;
      }),
    );
    return filePaths;
  }

  async uploadFilesWithFields(
    userId: string,
    files: { photo: Express.Multer.File[]; documents: Express.Multer.File[] },
  ): Promise<{ photoPath: string; documentPaths: string[] }> {
    // Verifique se o arquivo de foto existe
    if (!files.photo || files.photo.length === 0) {
      throw new Error('Photo file is missing');
    }
    // Faça o upload da foto
    const photoPath = await this.upload(userId, files.photo[0].buffer);
    // Verifique se os documentos existem
    if (!files.documents || files.documents.length === 0) {
      throw new Error('Document files are missing');
    }
    // Faça o upload dos documentos
    const documentPaths = await this.uploadFiles(userId, files.documents);
    return {
      photoPath,
      documentPaths,
    };
  }
}
