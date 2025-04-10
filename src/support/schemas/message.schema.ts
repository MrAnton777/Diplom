import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema()
export class Message{
    @Prop({required:true,unique:true})
    public author:Types.ObjectId

    @Prop({required:true})
    public sentAt: Date

    @Prop({required:true})
    public text:string

    @Prop()
    public readAt?:Date
}

export const MessageSchema = SchemaFactory.createForClass(Message);