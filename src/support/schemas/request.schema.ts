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

    @Prop({ type: [MessageSchema], default: [] })
    public messages: Message[]

    @Prop({ default: true })
    isActive: boolean;
}

export const SupportRequestSchema = SchemaFactory.createForClass(SupportRequest);