import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import * as jwt from 'jsonwebtoken'
export class UserInterceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, handler: CallHandler) {
        // Everything here will be intercepting the request.
        const request = context.switchToHttp().getRequest()
        // console.log({ request })
        const token = request?.headers?.authorization?.split("Bearer ")[1]
        // console.log({ token })
        const user = await jwt.decode(token)
        // console.log(user)
        request.user = user;

        return handler.handle()// everything inside the handle is intercepting the response.
    }
}

// Inorder to use this interceptor, we need to put it in a module. We are going to put it in the
// app module to be precise. It will make it avaliable to literally every single endpoint out there.
