import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId,Types } from 'mongoose';
import { Hotel } from './hotel.schema';

export type RoomDocument = Room & Document

@Schema()
export class Room{
    @Prop({ 
        type: Types.ObjectId, 
        ref: Hotel.name, 
        required: true 
      })
    hotel: Types.ObjectId

    @Prop()
    public desc:string

    @Prop()
    public images:string[]

    @Prop({required:true})
    public createdAt:Date

    @Prop({required:true})
    public updatedAt:Date

    @Prop({default:true})
    public isEnabled:boolean

    

}

export let RoomSchema = SchemaFactory.createForClass(Room)