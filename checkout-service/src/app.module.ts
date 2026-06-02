import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { HealthController } from './health/health.controller';
import { OrdersModule } from './orders/orders.module';
import { ProductsClientModule } from './products-client/products-client.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig),
    EventsModule,
    AuthModule,
    CartModule,
    OrdersModule,
    ProductsClientModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
