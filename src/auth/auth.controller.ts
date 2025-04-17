import { Controller ,Body,Post} from '@nestjs/common';
import { AuthService } from './auth.service';
import { signInDto, signUpDto } from './dto/auth.dto';
import { CurrentUser } from './dto/user.decorator';
import { User } from 'src/users/schemas/users.schema';
import { Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('api')
export class AuthController {
    constructor(private authService:AuthService){}

    @Post('auth/login')//2.3.1
    async login(@Body() data:signInDto, @CurrentUser() user:User,@Res() res:Response){
        if (user) return res.send('Вы уже аутентифицированны')
        
        let {token,userData} = await this.authService.signIn(data)

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
          });

        return {
            email:userData.email,
            name:userData.name,
            contactPhone:userData.contactPhone
        }
    }
    

}
