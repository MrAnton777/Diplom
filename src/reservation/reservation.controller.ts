import { Controller, UseGuards,Body,Post, Res,Get, Delete, Param } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Reservation, ReservationDocument } from './schemas/reservation.schema';
import { Model } from 'mongoose';
import { ReservationService } from './reservation.service';
import { Room, RoomDocument } from 'src/hotels/schemas/room.schema';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { createReservationDto } from './interfaces/interfaces';
import { CurrentUser } from 'src/auth/dto/user.decorator';
import { User, UserDocument } from 'src/users/schemas/users.schema';
import { Response } from 'express';
import { ID } from 'src/types/types';
import { Hotel, HotelDocument } from 'src/hotels/schemas/hotel.schema';

@Controller('api')
export class ReservationController {
    constructor(
        @InjectModel(Reservation.name) private reservationModel:Model<ReservationDocument>,
        @InjectModel(Room.name) private roomModel:Model<RoomDocument>,
        @InjectModel(Hotel.name) private hotelModel:Model<HotelDocument>,
        private reservationService:ReservationService
    ){}

    @UseGuards(JwtAuthGuard)
    @Post('client/reservations') //2.2.1 !
    async createReservation(
        @Body() data:createReservationDto,
        @CurrentUser() user,
        @Res() res:Response
    ){
        if (user.role != 'client') return res.status(403).send('Вы не клиент');
        
        let room = await this.roomModel.findById(data.hotelRoom).exec()
        if(!room) return res.status(400).send('Room not found')
        
        let userId:ID = user.userId as ID

        let newReservation = await this.reservationService.addReservation({
            userId:userId,
            hotelId:room.hotel,
            roomId:data.hotelRoom,
            dateStart:data.startDate,
            dateEnd:data.endDate
        })

        res.json({
            startDate:newReservation.dateStart,
            endDate:newReservation.dateEnd,
            hotelRoom:newReservation.roomId,
            hotel:newReservation.hotelId
        })
    }

    @UseGuards(JwtAuthGuard)
    @Get('client/reservations') //2.2.2 !
    async getClientReservations(@CurrentUser() user,@Res() res:Response){
        if (user.role != 'client') return res.status(403).send('Вы не клиент');

        let userId:ID = user.userId as ID

        let reservations = await this.reservationService.getReservations({userId:userId})

        let response = await Promise.all(reservations.map(async (reserv)=>{
            let hotel = await this.hotelModel.findById(reserv.hotelId);
            let room = await this.roomModel.findById(reserv.roomId);

            return {
                startDate:reserv.dateStart,
                endDate:reserv.dateEnd,
                hotelRoom:{
                    description:room?.desc,
                    images:room?.images,
                },
                hotel:{
                    title:hotel?.title,
                    description:hotel?.desc
                }
            }
        }))
        
        res.send(response)
    }

    @UseGuards(JwtAuthGuard)
    @Delete('client/reservations/:id') //2.2.3 !
    async deleteClientrReservation(@Param('id') reservationId:ID,@CurrentUser() user,@Res() res:Response){
        if (user.role != 'client') return res.status(403).send('Вы не клиент');
        let reservation = await this.reservationModel.findById(reservationId).exec()
        if(!reservation) return res.status(400).send('Reservation not found');
        if (reservation.userId != user.userId) return res.status(403).send('Forbidden for you');

        await this.reservationModel.deleteOne({_id:reservationId})
        res.send('ok')
    }

    @UseGuards(JwtAuthGuard)
    @Get('manager/reservations/:userId') //2.2.4 !
    async getReservations(
        @Param('userId') userId:ID,
        @CurrentUser() user,
        @Res() res:Response
    ){
        if (user.role != 'manager') return res.status(403).send('Вы не менеджер');

        let reservations = await this.reservationService.getReservations({userId:userId})

        let response = await Promise.all(reservations.map(async (reserv)=>{
            let hotel = await this.hotelModel.findById(reserv.hotelId);
            let room = await this.roomModel.findById(reserv.roomId);

            return {
                startDate:reserv.dateStart,
                endDate:reserv.dateEnd,
                hotelRoom:{
                    description:room?.desc,
                    images:room?.images,
                },
                hotel:{
                    title:hotel?.title,
                    description:hotel?.desc
                }
            }
        }))

        res.send(response)
    }

    @UseGuards(JwtAuthGuard)
    @Delete('manager/reservations/:id') //2.2.5 !
    async deleteReservation(
        @Param('id') id:ID,
        @CurrentUser() user,
        @Res() res:Response
    ){
        if (user.role != 'manager') return res.status(403).send('Вы не менеджер');

        let reservation = await this.reservationModel.findById(id).exec()
        if(!reservation) return res.status(400).send('Reservation not found')

        await this.reservationModel.deleteOne({_id:id})
        res.send('ok')
    }
}
