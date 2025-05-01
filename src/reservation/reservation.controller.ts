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

@Controller('api')
export class ReservationController {
    constructor(
        @InjectModel(Reservation.name) private reservationModel:Model<ReservationDocument>,
        @InjectModel(Room.name) private roomModel:Model<RoomDocument>,
        private reservationService:ReservationService
    ){}

    @UseGuards(JwtAuthGuard)
    @Post('client/reservations') //2.2.1
    async createReservation(
        @Body() data:createReservationDto,
        @CurrentUser() user:UserDocument,
        @Res() res:Response
    ){
        if (user.role != 'client') return res.status(403).send('Вы не клиент');
        
        let room = await this.roomModel.findById(data.hotelRoom).exec()
        if(!room) return res.status(400).send('Room not found')
        
        let userId:ID = user._id as ID

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
    @Get('client/reservations') //2.2.2
    async getClientReservations(@CurrentUser() user:UserDocument,@Res() res:Response){
        if (user.role != 'client') return res.status(403).send('Вы не клиент');

        let userId:ID = user._id as ID

        let reservations = await this.reservationService.getReservations({userId:userId})

        res.send(reservations)
    }

    @UseGuards(JwtAuthGuard)
    @Delete('client/reservations/:id') //2.2.3
    async deleteClientrReservation(@Param() reservationId:ID,@CurrentUser() user:UserDocument,@Res() res:Response){
        if (user.role != 'client') return res.status(403).send('Вы не клиент');
        let reservation = await this.reservationModel.findById(reservationId).exec()
        if(!reservation) return res.status(400).send('Reservation not found');
        if (reservation.userId != user._id) return res.status(403).send('Forbidden for you');

        await this.reservationModel.deleteOne({_id:reservationId})

    }

    @UseGuards(JwtAuthGuard)
    @Get('manager/reservations/:userId') //2.2.4
    async getReservations(
        @Param() userId:ID,
        @CurrentUser() user:UserDocument,
        @Res() res:Response
    ){
        if (user.role != 'manager') return res.status(403).send('Вы не менеджер');

        let reservations = await this.reservationService.getReservations({userId:userId})

        res.send(reservations)
    }

    @UseGuards(JwtAuthGuard)
    @Delete('manager/reservations/:id') //2.2.5 
    async deleteReservation(
        @Param() id:ID,
        @CurrentUser() user:UserDocument,
        @Res() res:Response
    ){
        if (user.role != 'manager') return res.status(403).send('Вы не менеджер');

        let reservation = await this.reservationModel.findById(id).exec()
        if(!reservation) return res.status(400).send('Reservation not found')

        await this.reservationModel.deleteOne({_id:id})
    }
}
