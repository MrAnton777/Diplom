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
import { createHotelDto, createRoomDto, updateRoomDto } from './interfaces/dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { error, time } from 'console';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UseInterceptors } from '@nestjs/common';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path'
import { UploadedFiles } from '@nestjs/common';
import { Express } from 'express';
import { Response } from 'express';


@Controller('api')
export class HotelsController {
    constructor(
        @InjectModel(Room.name) private roomModel:Model<RoomDocument>,
        @InjectModel(Hotel.name) private hotelModel:Model<HotelDocument>,
        private roomService:RoomService,
        private hotelService:HotelService
){}
    @Get('common/hotel-rooms')//2.1.1 !
    async getHotelRooms(@Query() params:SearchRoomsParams,@CurrentUser() user:User,@Res() res:Response){
        if (!user || user.role === 'client') params.isEnabled = true;

        let result =  await this.roomService.search(params)

        let response = await Promise.all(result.map(async(room)=>{
          let hotel = await this.hotelModel.findById(room.hotel)
          return {
            id:room._id,
            description:room.desc,
            images:room.images,
            hotel:{
              id:hotel?._id,
              title:hotel?.title
            }
          }
        }))
        
        res.json(response)
    }

    @Get('common/hotel-rooms/:id')//2.1.2 !
    async getRoomById(@Param('id') id:ID,@Res() res:Response){
        if (!id) throw new Error('Не предоставлен id номера');
        let result = await this.roomService.findById(id);
        let hotel = await this.hotelModel.findById(result.hotel);

        let response = {
          id:result._id,
          description:result.desc,
          images:result.images,
          hotel:{
            id:hotel?._id,
            title:hotel?.title,
            description:hotel?.desc
          }
          };

        res.send(response)
    }

    @UseGuards(JwtAuthGuard)
    @Post('admin/hotels/')//2.1.3 !
    async addHotel(@Body() dataDto:createHotelDto , @CurrentUser() user:User, @Res() res:Response){
        if (user.role != 'admin') return res.status(403).json({error:403,message:'У вас нет прав'})

        let data = {
          title:dataDto.title,
          desc:dataDto.description,
          createdAt:new Date(),
        }

        let result =  await this.hotelService.create(data)
        res.json({
          id:result._id,
          title:result.title,
          description:result.desc
        })
    }

    @UseGuards(JwtAuthGuard)
    @Get('admin/hotels/') //2.1.4 !
    async getHotels(@Query() params:SearchHotelParams,@CurrentUser() user:User,@Res() res:Response){
        if (user.role != 'admin') return res.status(403).json({error:403,message:'У вас нет прав'});

        let result =  await this.hotelService.search(params)
        let response:Object[] = []

        result.forEach(hotel=>{
          response.push({
            id:hotel._id,
            title:hotel.title,
            description:hotel.desc
          })

        })

        res.send(response)
    }

    @UseGuards(JwtAuthGuard)
    @Put('admin/hotels/:id') //2.1.5 !
    async updateHotel(@Param('id') id:ID,@Body() data:UpdateHotelParams,@Res() res:Response,@CurrentUser() user:User){
        if (user.role != 'admin') return res.status(403).json({error:403,message:'У вас нет прав'});

        let hotel =  await this.hotelService.update(id,data)

        res.json({
            id:hotel._id,
            title:hotel.title,
            desc:hotel.desc
        })
    }

    @UseGuards(JwtAuthGuard)
    @Post('admin/hotel-rooms/') //2.1.6 !
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

        let result =  await this.roomService.create(data)
        let hotel = await this.hotelModel.findById(result.hotel);
        let response = {
          id:result._id,
          description:result.desc,
          images:result.images,
          isEnabled:result.isEnabled,
          hotel:{
            id:hotel?._id,
            title:hotel?.title,
            description:hotel?.desc
          }
        }

        res.send(response)
    }


    @UseGuards(JwtAuthGuard)
    @Put('admin/hotel-rooms/:id') //2.1.7 !
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
      async updateRoom(
        @Param('id') id:ID,
        @Body() data:updateRoomDto,
        @Res() res:Response,
        @CurrentUser() user:User,
        @UploadedFiles() images:Express.Multer.File[]
      ){
        if (user.role != 'admin') return res.status(403).json({error:403,message:'У вас нет прав'});

        let existingImages = data.existingImages || [];
        let newImagePaths = images?.map(file => file.filename) || [];
        let allImages = [...existingImages,...newImagePaths];

        let result = await this.roomService.update(id,{
            hotel:data.hotelId,
            desc:data.description,
            images:allImages,
            updatedAt:new Date()
        })
        let hotel = await this.hotelModel.findById(result.hotel)

        res.json({
            id:result._id,
            desciption:result.desc,
            images:result.images,
            isEnabled:result.isEnabled,
            hotel:{
              id:hotel?._id,
              title:hotel?.title,
              description:hotel?.desc
            }
        })
      }
} 
