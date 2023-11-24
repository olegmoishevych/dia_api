import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { DatabaseService } from "../db/database.service";

@Injectable()
export class ImageService {
  private readonly uploadFolder = 'uploads';
  constructor(private dbService: DatabaseService) {
    this.ensureUploadFolderExists();
  }
  private ensureUploadFolderExists() {
    if (!fs.existsSync(this.uploadFolder)) {
      fs.mkdirSync(this.uploadFolder, { recursive: true });
    }
  }

  async handleFile(file: Express.Multer.File): Promise<void> {
    const processedImage = await sharp(file.buffer)
      .resize(300, 300)
      .toBuffer();

    const filename = Date.now() + path.extname(file.originalname);
    const filepath = path.join(this.uploadFolder, filename);

    fs.writeFileSync(filepath, processedImage);
    await this.dbService.saveImagePath(filepath);
  }
}
