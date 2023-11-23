import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from './db/database.service';

@Controller()
export class AppController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  getHello(): string {
    return 'Hello World!';
  }
}
