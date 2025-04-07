import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HotelDocument = Hotel & Document;

@Schema()
export class Hotel{
    @Prop({required:true,unique:true})
    public title:string

    @Prop()
    public desc:string

    @Prop({required:true})
    public createdAt:Date

    @Prop({required:true})
    public updatedAt:Date
}

export let HotelSchema = SchemaFactory.createForClass(Hotel)