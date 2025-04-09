import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Reservation, ReservationDocument } from './schemas/reservation.schema';
import { Model } from 'mongoose';
import { IReservation, ReservationDto, ReservationSearchOptions } from './interfaces/interfaces';
import { ID } from 'src/types/types';

@Injectable()
export class ReservationService implements IReservation{
    constructor( @InjectModel(Reservation.name) private reservationModel:Model<ReservationDocument>){}

    async addReservation(data:ReservationDto):Promise<ReservationDocument>{
        const unavailability = await this.reservationModel.countDocuments({
            roomId: data.roomId,
            $or: [
              { dateStart: { $lt: data.dateEnd, $gte: data.dateStart } },
              { dateEnd: { $gt: data.dateStart, $lte: data.dateEnd } },
              { dateStart: { $lte: data.dateStart }, dateEnd: { $gte: data.dateEnd } }
            ]
          });
      
          if (unavailability > 0) {
            throw new Error('Номер занят на указанные даты');
          }

        let newReservation = await this.reservationModel.create(data)
        await newReservation.save()

        return newReservation
    }

    async removeReservation(id:ID): Promise<void>{
        await this.reservationModel.findByIdAndDelete(id)
    }

    async getReservations(data:ReservationSearchOptions):Promise<ReservationDocument[]>{
        let query:any = {userId:data.userId}

        if (data.dateStart && data.dateEnd) {
            query.dateStart = { $gte: data.dateStart };
            query.dateEnd = { $lte: data.dateEnd };
          }

        let result = await this.reservationModel.find(query)
        if (!result){
            throw new Error('Брони не найдены')
        }

        return result
    }


}
