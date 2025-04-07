import { Module } from '@nestjs/common';
import { HotelService,RoomService } from './hotels.service';
import { MongooseModule } from '@nestjs/mongoose';
import { HotelSchema,Hotel } from './schemas/hotel.schema';
import { RoomSchema } from './schemas/room.schema';

@Module({
  imports:[MongooseModule.forFeature([{ name: 'Hotel', schema: HotelSchema },{name:'Room',schema:RoomSchema}])],
  providers: [HotelService,RoomService]
})
export class HotelsModule {}
