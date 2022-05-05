import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { AppConfig } from './config/app.config';

@Injectable()
export class AppService {
  constructor(
    @Inject(AppConfig.KEY)
    private readonly appConfig: ConfigType<typeof AppConfig>,
  ) /* private readonly configService: ConfigService */ {}

  getHello(): string {
    console.log(this.appConfig.constructor.name);
    return 'Hello World!';
  }
}
