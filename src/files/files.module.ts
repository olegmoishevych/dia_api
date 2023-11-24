import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { ImageService } from "./image.service";
import { DatabaseService } from "../db/database.service";

@Module({
  controllers: [FilesController],
  providers: [ImageService, DatabaseService],
})
export class FilesModule {}
