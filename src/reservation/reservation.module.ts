import { HostParam, Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Reservation,ReservationSchema } from './schemas/reservation.schema';
import { ReservationController } from './reservation.controller';
import { RoomSchema } from 'src/hotels/schemas/room.schema';
import { Room } from 'src/hotels/schemas/room.schema';
import { HotelSchema } from 'src/hotels/schemas/hotel.schema';
import { Hotel } from 'src/hotels/schemas/hotel.schema';

@Module({
  imports:[MongooseModule.forFeature([{name:Reservation.name,schema:ReservationSchema},{name:Room.name,schema:RoomSchema},{name:Hotel.name,schema:HotelSchema}])],
  providers: [ReservationService],
  controllers: [ReservationController]
})
export class ReservationModule {}
