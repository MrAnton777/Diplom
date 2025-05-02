import { Types } from "mongoose";

export interface createHotelDto{
    title: string;
    desc: string;
    createdAt?:Date
}

export interface createRoomDto{
    description:string,
    hotelId:Types.ObjectId
}

export interface updateRoomDto extends createRoomDto{
    existingImages?:string[]
}