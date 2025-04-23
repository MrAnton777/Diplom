import { Types } from "mongoose";

export interface createHotelDto{
    title: string;
    description: string;
    createdAt?:Date
}

export interface createRoomDto{
    description:string,
    hotelId:Types.ObjectId
}