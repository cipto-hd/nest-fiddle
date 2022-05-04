import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class WrapResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if ((context.getType() || 'graphql') === 'graphql') return next.handle();

    return next.handle().pipe(
      map((data) => ({
        data,
      })),
    );
  }
}
