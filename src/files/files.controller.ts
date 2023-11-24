import { Controller, Get, HttpCode, HttpStatus, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ImageService } from "./image.service";
import { FileInterceptor } from "@nestjs/platform-express";
import * as fs from "fs";
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags('files')
@Controller('files')
export class FilesController {
  private readonly uploadFolder = 'uploads';
  constructor(private readonly imageService: ImageService) {}

  @ApiOperation({ summary: 'Upload an image file' })
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'The image file to upload',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    await this.imageService.handleFile(file);
  }

  @ApiOperation({ summary: 'Get list of uploaded images' })
  @ApiResponse({
    status: 200,
    description: 'List of images',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'object',
          additionalProperties: {
            type: 'string',
          },
        },
      },
    },
  })
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
