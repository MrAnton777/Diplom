import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Message,MessageSchema } from './message.schema';

export type SupportRequestDocument = SupportRequest & Document;

@Schema()
export class SupportRequest{
    @Prop({required:true})
    public user:Types.ObjectId

    @Prop({required:true})
    public createdAt: Date

    @Prop({ default: [] })
    public messages: Types.ObjectId[]

    @Prop({ default: true })
    isActive: boolean;
}

export const SupportRequestSchema = SchemaFactory.createForClass(SupportRequest);