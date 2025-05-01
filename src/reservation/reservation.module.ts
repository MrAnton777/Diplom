import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Reservation,ReservationSchema } from './schemas/reservation.schema';
import { ReservationController } from './reservation.controller';
import { RoomSchema } from 'src/hotels/schemas/room.schema';
import { Room } from 'src/hotels/schemas/room.schema';

@Module({
  imports:[MongooseModule.forFeature([{name:Reservation.name,schema:ReservationSchema},{name:Room.name,schema:RoomSchema}])],
  providers: [ReservationService],
  controllers: [ReservationController]
})
export class ReservationModule {}
