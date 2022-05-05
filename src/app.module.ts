import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppResolver } from './app.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoffeeModule } from './coffee/coffee.module';
import { ConfigModule } from '@nestjs/config';
import { AppConfig } from './config/app.config';
import { getConnectionOptions } from 'typeorm';
import { LoggingMiddleware } from './common/middlewares/logging.middleware';
import redis from 'mqemitter-redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [AppConfig],
    }),
    ConfigModule.forFeature(AppConfig),
    TypeOrmModule.forRootAsync({
      useFactory: async () =>
        Object.assign(await getConnectionOptions(), {
          autoLoadEntities: true,
          synchronize: true,
        }),
    }),
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      graphiql: true,
      autoSchemaFile: true,
      subscription:
        process.env.NODE_ENV === 'test'
          ? true
          : {
              emitter: redis({
                port: 6379,
                host: '127.0.0.1',
              }),
            },
    }),
    CoffeeModule,
    // CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).exclude('graphql');
  }
}
