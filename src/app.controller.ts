import { Controller, Get, Sse } from '@nestjs/common';
import { interval, map, Observable } from 'rxjs';
import { AppService } from './app.service';
// import { Protocol } from './common/decorators/protocol.decorator';
import { Public } from './common/decorators/public.decorator';

export interface MessageEvent {
  data: string | object;
  id?: string;
  type?: string;
  retry?: number;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  async getHello(): // @Protocol({ role: 'boss' }) protocol: string,
  Promise<string> {
    // console.log(protocol);
    /** For testing timeout interceptor */
    // await new Promise((resolve) => setTimeout(resolve, 5000));
    return this.appService.getHello();
  }

  @Sse('sse')
  sse(): Observable<MessageEvent> {
    return interval(1000).pipe(map(() => ({ data: { hello: 'world' } })));
  }
}
