import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from './db/database.service';
import { ApiExcludeEndpoint, ApiTags } from "@nestjs/swagger";

@Controller()
export class AppController {
  constructor(private readonly databaseService: DatabaseService) {}
  @ApiExcludeEndpoint()
  @Get()
  getHello(): string {
    return 'Hello World!';
  }
}
