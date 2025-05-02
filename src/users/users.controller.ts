import { Controller, UseGuards,Post,Body ,Res, Get, Query} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/users.schema';
import { Model } from 'mongoose';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { createUserDto, SearchUserParams } from './interfaces/interfaces';
import { CurrentUser } from 'src/auth/dto/user.decorator';
import { Response } from 'express';

@Controller('api')
export class UsersController {
    constructor(
        @InjectModel(User.name) private userModel:Model<UserDocument>,
        private userService:UsersService
    ){}

    @UseGuards(JwtAuthGuard)
    @Post('admin/users/') //2.4.1
    async createUserAsAdmin(
        @Body() data:createUserDto,
        @CurrentUser() user:UserDocument,
        @Res() res:Response
    ){
        if(user.role != 'admin') return res.status(403).send('Вы не админ');

        let email_check = await this.userModel.find({email:data.email})
        if(email_check.length != 0) return res.status(400).send('Пользователь с данным email уже существует');

        let newUser = await this.userService.create(data)

        res.json({
            id:newUser._id,
            email:newUser.email,
            name:newUser.name,
            role:newUser.role
        })
    }

    @UseGuards(JwtAuthGuard)
    @Get('admin/users/') //2.4.2 admin
    async getUsersAdmin(
        @Query() params:SearchUserParams,
        @CurrentUser() user:UserDocument,
        @Res() res:Response
    ){
        if(user.role != 'admin') return res.status(403).send('Вы не админ');

        let result = await this.userService.findAll(params);

        res.send(result)
    }

    @UseGuards(JwtAuthGuard)
    @Get('manager/users/') //2.4.2 manager
    async getUsersManager(
        @Query() params:SearchUserParams,
        @CurrentUser() user:UserDocument,
        @Res() res:Response
    ){
        if(user.role != 'manager') return res.status(403).send('Вы не менеджер');

        let result = await this.userService.findAll(params);

        res.send(result)
    }

    
}
