import { Controller ,Get,Post,Body, UseGuards,Res} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SupportRequest, SupportRequestDocument } from './schemas/request.schema';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { SupportRequestClientService, SupportRequestEmployeeService, SupportRequestService } from './support.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { CurrentUser } from 'src/auth/dto/user.decorator';
import { UserDocument } from 'src/users/schemas/users.schema';
import { Response } from 'express';
import { ID } from 'src/types/types';

@Controller('api')
export class SupportController {
    constructor(
        @InjectModel(SupportRequest.name) private supportRequestModel:Model<SupportRequestDocument>,
        @InjectModel(Message.name) private messageModel:Model<MessageDocument>,
        private supportService:SupportRequestService,
        private supportClientService:SupportRequestClientService,
        private supportEmployeeService:SupportRequestEmployeeService
    ){}

    @UseGuards(JwtAuthGuard)
    @Post('client/support-requests/') //2.5.1
    async createSupportRequest(
        @Body() data,
        @CurrentUser() user:UserDocument,
        @Res() res:Response
    ){
        if (user.role != 'client') return res.status(403).send('Вы не пользователь');

        let newRequest = await this.supportClientService.createSupportRequest({
            user:user._id as ID,
            text:data.text
        })

        res.send([{
            id:newRequest._id,
            createdAt:newRequest.createdAt,
            isActive:true,
            hasNewMessages:false
        }])
    }

    
}
