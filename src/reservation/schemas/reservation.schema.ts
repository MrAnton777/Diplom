import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId,Types } from 'mongoose';

export type ReservationDocument = Reservation & Document;

@Schema()
export class Reservation{
    @Prop({required:true})
    public userId:Types.ObjectId

    @Prop({required:true})
    public hotelId:Types.ObjectId

    @Prop({required:true})
    public roomId:Types.ObjectId

    @Prop({required:true})
    public dateStart:Date

    @Prop({required:true})
    public dateEnd:Date
}

export let ReservationSchema = SchemaFactory.createForClass(Reservation);