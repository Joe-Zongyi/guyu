import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { v4 as uuidv4 } from 'uuid';

interface CreateFileInput {
  filename: string;
  originalName: string;
  contentType: string;
  size: number;
  url: string;
  requestId?: string;
  plantId?: string;
}

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(private readonly db: DatabaseService) {}

  async createFileRecord(input: CreateFileInput) {
    const fileId = `file_${uuidv4().replace(/-/g, '').slice(0, 16)}`;

    const file = await this.db.file.create({
      data: {
        file_id: fileId,
        filename: input.filename,
        original_name: input.originalName,
        content_type: input.contentType,
        size: input.size,
        url: input.url,
        request_id: input.requestId,
        plant_id: input.plantId,
      },
    });

    this.logger.log(`File created: ${fileId}`);

    return {
      status: 'success',
      data: {
        file_id: file.file_id,
        url: file.url,
        content_type: file.content_type,
        size: file.size,
        created_at: file.created_at,
      },
    };
  }

  async getFileByFileId(fileId: string) {
    const file = await this.db.file.findUnique({
      where: { file_id: fileId },
    });

    if (!file) {
      throw new NotFoundException(`File not found: ${fileId}`);
    }

    return {
      file_id: file.file_id,
      url: file.url,
      content_type: file.content_type,
      size: file.size,
      original_name: file.original_name,
      created_at: file.created_at,
    };
  }

  async getFilesByPlantId(plantId: string) {
    return this.db.file.findMany({
      where: { plant_id: plantId },
      orderBy: { created_at: 'desc' },
    });
  }
}