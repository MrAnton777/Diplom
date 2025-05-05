import { Controller ,Get,Post,Body, UseGuards,Res, Query,Param} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SupportRequest, SupportRequestDocument } from './schemas/request.schema';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { SupportRequestClientService, SupportRequestEmployeeService, SupportRequestService } from './support.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { CurrentUser } from 'src/auth/dto/user.decorator';
import { User, UserDocument } from 'src/users/schemas/users.schema';
import { Response } from 'express';
import { ID } from 'src/types/types';
import { GetChatListParams, GetChatListParamsSearch } from './interfaces/interfaces';

@Controller('api')
export class SupportController {
    constructor(
        @InjectModel(SupportRequest.name) private supportRequestModel:Model<SupportRequestDocument>,
        @InjectModel(Message.name) private messageModel:Model<MessageDocument>,
        @InjectModel(User.name) private userModel:Model<UserDocument>,
        private supportService:SupportRequestService,
        private supportClientService:SupportRequestClientService,
        private supportEmployeeService:SupportRequestEmployeeService
    ){}

    @UseGuards(JwtAuthGuard)
    @Post('client/support-requests/') //2.5.1 !
    async createSupportRequest(
        @Body() data,
        @CurrentUser() user,
        @Res() res:Response
    ){
        if (user.role != 'client') return res.status(403).send('Вы не пользователь');

        let newRequest = await this.supportClientService.createSupportRequest({
            user:user.userId as ID,
            text:data.text
        })

        res.send([{
            id:newRequest._id,
            createdAt:newRequest.createdAt,
            isActive:true,
            hasNewMessages:false
        }])
    }

    @UseGuards(JwtAuthGuard)
    @Get('client/support-requests/') //2.5.2 !
    async getRequests(
        @Query() params,
        @CurrentUser() user,
        @Res() res:Response,
    ){
        if (user.role != 'client') return res.status(403).send('Вы не клиент');
        params = {
            ...params, user:user.userId,isActive:true
        };

        let result = await this.supportService.findSupportRequests(params)

        let response = await Promise.all(result.map(async(req)=>{
            return {
                id:req._id,
                createdAt:req.createdAt,
                isActive:req.isActive,
                hasNewMessages:await this.supportClientService.checkNewMessages(req._id as ID)

            }
        }))
       
        res.json(response)
    }

    @UseGuards(JwtAuthGuard)
    @Get('manager/support-requests/') //2.5.3 !
    async getRequestsAsManager(
        @Query() params:GetChatListParams,
        @CurrentUser() user:UserDocument,
        @Res() res:Response,
    ){
        if (user.role != 'manager') return res.status(403).send('Вы не менеджер');
        
        let result = await this.supportService.findSupportRequests(params)

        let response = await Promise.all(result.map(async(req)=>{
            let user = await this.userModel.findById(req._id)
            return {
                id:req._id,
                createdAt:req.createdAt,
                isActive:req.isActive,
                hasNewMessages:await this.supportClientService.checkNewMessages(req._id as ID),
                client:{
                    id:user?._id,
                    name:user?.name,
                    email:user?.email,
                    contactPhone:user?.contactPhone
                }
            }
        }))

        res.send(response)
    }

    @UseGuards(JwtAuthGuard)
    @Get('common/support-requests/:id/messages') //2.5.4 !
    async getMessages(
        @Param('id') id:ID,
        @CurrentUser() user,
        @Res() res:Response,
    ){
        let request = await this.supportRequestModel.findById(id);
        if(!request) return res.send('Запрос в техподдержку не найден')

        if(user.role == 'manager' || (user.role == 'client' && user.userId == request.user)){
            let messages = await this.supportService.getMessages(id);
            let result = await Promise.all( messages.map(async (mes)=>{
                let user = await this.userModel.findById(mes.author)
                return {
                    id:mes._id,
                    createdAt:mes.sentAt,
                    text:mes.text,
                    readAt:mes.readAt,
                    author:{
                        id:user?._id,
                        name:user?.name
                    }
                }
            }))

            res.send(result)
        }else{res.status(403).send('Ваша роль не подходит')}
    }

    @UseGuards(JwtAuthGuard)
    @Post('common/support-requests/:id/messages') //2.5.5 !
    async sendMessage(
        @Body() data,
        @Param('id') reqId:ID,
        @CurrentUser() user,
        @Res() res:Response,
    ){
        let request = await this.supportRequestModel.findById(reqId);
        if(!request) return res.send('Запрос в техподдержку не найден');
        
        if(user.role == 'manager' || (user.role == 'client' && user.userId == request.user)){
            let newMessage = await this.supportService.sendMessage({author:user.userId as ID,supportRequest:reqId,text:data.text});
            res.json({
                id:newMessage._id,
                createdAt:newMessage.sentAt,
                text:newMessage.text,
                readAt:newMessage.readAt,
                author:{
                    id:user.userId,
                    name:user.name
                }
            })
        }
        else{res.status(403).send('Ваша роль не подходит')}
    }

    @UseGuards(JwtAuthGuard)
    @Post('common/support-requests/:id/messages/read') //2.5.6 !
    async markMesRead(
        @Param('id') reqId:ID,
        @Body() data,
        @CurrentUser() user,
        @Res() res:Response
    ){
        if(user.role == 'manager'){
            await this.supportEmployeeService.markMessagesAsRead({
                user:user.userId,
                supportRequest:reqId,
                createdBefore:data.createdBefore
            })

            res.send('success')
        }

        let request = await this.supportRequestModel.findById(reqId);
        if (user.role == 'client' && user.userId == request?.user){
            await this.supportClientService.markMessagesAsRead({
                user:user.userId,
                supportRequest:reqId,
                createdBefore:data.createdBefore
            })

            res.send('success')
        }
    }

}
