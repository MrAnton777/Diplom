import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { HotelsModule } from './hotels/hotels.module';
import { ReservationModule } from './reservation/reservation.module';
import * as dotenv  from 'dotenv';
dotenv.config()

@Module({
  imports: [UsersModule,MongooseModule.forRoot(process.env.MONGO_URL || 'mongodb://localhost:27017/'), HotelsModule, ReservationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


