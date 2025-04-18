import { Controller, ForbiddenException, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hotel,HotelDocument } from './schemas/hotel.schema';
import { Room,RoomDocument } from './schemas/room.schema';
import { Get,Post,Body,Query,Param,Res } from '@nestjs/common';
import { SearchRoomsParams } from './interfaces/interfaces';
import { CurrentUser } from 'src/auth/dto/user.decorator';
import { User } from 'src/users/schemas/users.schema';
import { RoomService,HotelService } from './hotels.service';
import { ID } from 'src/types/types';
import { createHotelDto } from './interfaces/dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { error } from 'console';
import { Response } from 'express';


@Controller('api')
export class HotelsController {
    constructor(
        @InjectModel(Room.name) private roomModel:Model<RoomDocument>,
        @InjectModel(Hotel.name) private hotelModel:Model<HotelDocument>,
        private roomService:RoomService,
        private hotelService:HotelService
){}
    @Get('common/hotel-rooms')//2.1.1
    async getHotelRooms(@Query() params:SearchRoomsParams,@CurrentUser() user:User){
        if (!user || user.role === 'client') params.isEnabled = true

        return await this.roomService.search(params)
    }

    @Get('common/hotel-rooms/:id')//2.1.2
    async getRoomById(@Param() id:ID){
        if (!id) throw new Error('Не предоставлен id номера')
            return await this.roomService.findById(id)
    }

    @UseGuards(JwtAuthGuard)
    @Post('admin/hotels/')//2.1.3
    async addHotel(data:createHotelDto , @CurrentUser() user:User, @Res() res:Response){
        if (user.role != 'admin') return res.status(403).json({error:403,message:'У вас нет прав'})

        data = {...data,createdAt:new Date()}

        return await this.hotelService.create(data)
    }

} 
