import { Module } from '@nestjs/common';
import { HotelService,RoomService } from './hotels.service';
import { MongooseModule } from '@nestjs/mongoose';
import { HotelSchema,Hotel } from './schemas/hotel.schema';
import { RoomSchema } from './schemas/room.schema';
import { HotelsController } from './hotels.controller';

@Module({
  imports:[MongooseModule.forFeature([{ name: 'Hotel', schema: HotelSchema },{name:'Room',schema:RoomSchema}])],
  providers: [HotelService,RoomService],
  controllers: [HotelsController]
})
export class HotelsModule {}
