import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument,User,UserSchema } from 'src/users/schemas/users.schema';
import { UsersService } from 'src/users/users.service';
import { signUpDto,signInDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt'
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        @InjectModel(User.name) private userModel:Model<UserDocument>,
        private userService:UsersService
    ){}

    async signUp(data:signUpDto): Promise<any>{
        let {email,password,name,contactPhone,role} = data

        let email_test = await this.userModel.find({email:email}).exec()
        if (email_test) throw new Error('Пользователь с данным email существует')

        let newUser = await this.userService.create(data)

        let token = this.jwtService.sign({userId:newUser._id,email,name,role})

        return token

    }

    async signIn(data:signInDto):Promise<any>{
        let user = await this.userModel.findOne({email:data.email}).exec()

        if(!user) throw new UnauthorizedException('Аккаунта с данным Email не существует')

        let matching = await bcrypt.compare(data.password,user.passwordHash)

        if (!matching) throw new UnauthorizedException('Пароль неверный')

        let token = this.jwtService.sign({userId:user._id,email:user.email,name:user.name,role:user.role})
        
        let userData = user

        return {token,userData}
    }

      async validateUser(payload: any): Promise<any> {
        
        return { userId: payload.id, email: payload.email,name:payload.name, contactPhone:payload.contactPhone ,role: payload.role };
      }

}
