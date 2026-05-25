import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { EventsModule } from './events/events.module';

@Module({
  imports: [TypeOrmModule.forRoot(databaseConfig), EventsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
