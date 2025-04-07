import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ModifiedPathsSnapshot } from 'mongoose';
import { HotelSchema,HotelDocument,Hotel } from './schemas/hotel.schema';
import { ID } from 'src/types/types';
import { HotelRoomService, IHotelService, SearchHotelParams,UpdateHotelParams,SearchRoomsParams } from './interfaces/interfaces';
import { Room, RoomDocument } from './schemas/room.schema';

@Injectable()
export class HotelService implements IHotelService{
    constructor(@InjectModel(Hotel.name) private hotelModel: Model<HotelDocument>){}

    async create(data: Partial<HotelDocument>): Promise<HotelDocument> {
        const hotel = new this.hotelModel(data);
        return hotel.save();
      }

      async findById(id: ID): Promise<HotelDocument|null> {
        return await this.hotelModel.findById(id).exec();
      }

      async search(params: SearchHotelParams): Promise<HotelDocument[]> {
        const { limit, offset, title } = params;
        const query = title ? { title: { $regex: title, $options: 'i' } } : {};
        return await this.hotelModel.find(query).skip(offset).limit(limit).exec();
      }

      async update(id: ID, data: UpdateHotelParams): Promise<HotelDocument|null> {
        return await this.hotelModel.findByIdAndUpdate(id, data, { new: true }).exec();
      }
      
}


@Injectable()
export class RoomService implements HotelRoomService{
  constructor(@InjectModel(Room.name) private roomModel:Model<RoomDocument>){}

  async create(data: Partial<RoomDocument>): Promise<RoomDocument> {
    const hotel = new this.roomModel(data);
    return hotel.save();
  }

  async findById(id: ID): Promise<RoomDocument|null> {
    return await this.roomModel.findById(id).exec();
  }

  async search(params: SearchRoomsParams): Promise<RoomDocument[]> {
    const { limit, offset, hotel, isEnabled } = params;
    const query: any = { hotel };
    
    if (isEnabled) {
      query.isEnabled = isEnabled;
    }

    return this.roomModel
      .find(query)
      .skip(offset)
      .limit(limit)
      .exec();
  }

  async update(id: ID, data: Partial<RoomDocument>): Promise<RoomDocument|null> {
    return this.roomModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }
}