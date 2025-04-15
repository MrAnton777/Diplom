import {ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";
import { Observable } from "rxjs";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt'){
    public canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        return super.canActivate(context)
    }

    public handleRequest(err, user, info) {
        
        if (err) {
            throw err;
        }
        if (!user) {
            throw new UnauthorizedException('Не авторизован');
        }

        return user;
    }
}