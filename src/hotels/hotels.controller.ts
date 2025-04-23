import { Controller, ForbiddenException, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hotel,HotelDocument } from './schemas/hotel.schema';
import { Room,RoomDocument } from './schemas/room.schema';
import { Get,Post,Body,Query,Put,Param,Res } from '@nestjs/common';
import { SearchHotelParams, SearchRoomsParams, UpdateHotelParams } from './interfaces/interfaces';
import { CurrentUser } from 'src/auth/dto/user.decorator';
import { User } from 'src/users/schemas/users.schema';
import { RoomService,HotelService } from './hotels.service';
import { ID } from 'src/types/types';
import { createHotelDto, createRoomDto } from './interfaces/dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { error, time } from 'console';
import { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UseInterceptors } from '@nestjs/common';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path'
import { UploadedFiles } from '@nestjs/common';
import { Express } from 'express';


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

    @UseGuards(JwtAuthGuard)
    @Get('admin/hotels/') //2.1.4
    async getHotels(@Query() params:SearchHotelParams,@CurrentUser() user:User,@Res() res:Response){
        if (user.role != 'admin') return res.status(403).json({error:403,message:'У вас нет прав'});

        return await this.hotelService.search(params)
    }

    @UseGuards(JwtAuthGuard)
    @Put('admin/hotels/:id') //2.1.5
    async updateHotel(@Param() id:ID,@Body() data:UpdateHotelParams,@Res() res:Response,@CurrentUser() user:User){
        if (user.role != 'admin') return res.status(403).json({error:403,message:'У вас нет прав'});

        let hotel =  await this.hotelService.update(id,data)

        return {
            id:hotel._id,
            title:hotel.title,
            desc:hotel.desc
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('admin/hotel-rooms/') //2.1.6
    @UseInterceptors(FilesInterceptor('images', 10, {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, cb) => {
            const filename: string = uuidv4();
            const extension: string = path.parse(file.originalname).ext;
            cb(null, `${filename}${extension}`);
          }
        })
      }))
    async createRoom(@Body() dataDto:createRoomDto,@Res() res:Response,@CurrentUser() user:User,@UploadedFiles() images:Express.Multer.File[]){
        if (user.role != 'admin') return res.status(403).json({error:403,message:'У вас нет прав'});

        let imagesPaths = images.map(image => image.filename)

        let data = {
            hotel:dataDto.hotelId,
            desc:dataDto.description,
            images:imagesPaths,
            createdAt:new Date(),
            updatedAt:new Date(),
            isEnabled:true
        } as Room

        return await this.roomService.create(data)
    }

} 
