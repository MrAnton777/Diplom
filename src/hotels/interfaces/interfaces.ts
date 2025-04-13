import { ID } from "src/types/types";
import { HotelDocument } from "../schemas/hotel.schema";
import { NullExpression } from "mongoose";
import { Room,RoomDocument } from "../schemas/room.schema";

export interface SearchHotelParams {
    limit: number;
    offset: number;
    title: string;
  }

export interface UpdateHotelParams {
    title: string;
    description: string;
}

export interface SearchRoomsParams {
    limit: number;
    offset: number;
    hotel: ID;
    isEnabled?: boolean;
  }

export interface IHotelService {
  create(data: Partial<HotelDocument>): Promise<HotelDocument>;
  findById(id: ID): Promise<HotelDocument>;
  search(params: SearchHotelParams): Promise<HotelDocument[]>;
  update(id: ID, data: UpdateHotelParams): Promise<HotelDocument>;
}

export interface HotelRoomService {
  create(data: Partial<RoomDocument>): Promise<RoomDocument>;
  findById(id: ID): Promise<RoomDocument>;
  search(params: SearchRoomsParams): Promise<RoomDocument[]>;
  update(id: ID, data: Partial<RoomDocument>): Promise<RoomDocument>;
}