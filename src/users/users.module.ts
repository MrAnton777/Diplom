import { Module } from '@nestjs/common';
import { IUsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/users.schema';  

@Module({
    imports:[MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
    providers: [IUsersService]
})
export class UsersModule {}