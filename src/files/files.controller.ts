import { Controller, Get, HttpCode, HttpStatus, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ImageService } from "./image.service";
import { FileInterceptor } from "@nestjs/platform-express";
import * as fs from "fs";

@Controller('files')
export class FilesController {
  private readonly uploadFolder = 'uploads';
  constructor(private readonly imageService: ImageService) {}

  @HttpCode(HttpStatus.OK)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    await this.imageService.handleFile(file);
  }

  @HttpCode(HttpStatus.OK)
  @Get('images')
  getImages(): { [key: string]: string } {
    const filenames = fs.readdirSync(this.uploadFolder);
    const files = filenames.reduce((acc, filename, index) => {
      acc[`file${index + 1}`] = `http://localhost:5000/uploads/${filename}`;
      return acc;
    }, {} as any);

    return { files };
  }
}
