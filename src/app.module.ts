import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './db/database.service';
import { AuthModule } from './auth/auth.module';
import { EventsGateway } from './events/events.gateway';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule],
  controllers: [AppController],
  providers: [AppService, DatabaseService, EventsGateway],
})
export class AppModule {}
