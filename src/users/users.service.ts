import { Injectable } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model,Connection, HydratedDocument } from 'mongoose';
import { UserSchema,UserDocument,User } from './schemas/users.schema';
import * as bcrypt from 'bcrypt';
import { ID } from 'src/types/types';
import { IUserService, SearchUserParams } from './interfaces/interfaces';
import { createUserDto } from './interfaces/interfaces';

@Injectable()
export class UsersService implements IUserService{
    constructor(
        @InjectModel(User.name) private userModel:Model<UserDocument>,
        @InjectConnection() private connection: Connection,
    ){}

    async create(data: createUserDto): Promise<UserDocument>{
        try{
            let hashedPassword = await bcrypt.hash(data.password,10)

            let payload:any = {
                email:data.email,
                passwordHash:hashedPassword,
                name:data.name,
                contactPhone:data.contactPhone,
                role:data.role
                
            }

            let newUser = await this.userModel.create(payload)

            await newUser.save()
            return newUser
        }
        catch(e){
            throw new Error('Ошибка создания пользователя')
        }

    }

    async findById(id: ID): Promise<UserDocument>{
        let user = await this.userModel.findById(id)
        if(!user) throw new Error('Пользователь не найден')
        return user
    }

    async findByEmail(email: string): Promise<UserDocument>{
        let user = await this.userModel.findOne({email})
        if (!user) throw new Error('Пользователь по email не найден')
        return user
    }

    async findAll(params: SearchUserParams): Promise<UserDocument[]>{
    const { limit, offset, email, name, contactPhone } = params;
    const conditions: any = {};

    if (email) conditions.email = { $regex: email, $options: 'i' };
    if (name) conditions.name = { $regex: name, $options: 'i' };
    if (contactPhone) conditions.contactPhone = { $regex: contactPhone, $options: 'i' };
    
    return await this.userModel.find(conditions).skip(offset).limit(limit).exec()

    }

}