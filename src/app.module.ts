import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppResolver } from './app.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoffeeModule } from './coffee/coffee.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: '127.0.0.1',
      database: 'nestjs_fiddle',
      username: 'root',
      password: 'bismillah',
      autoLoadEntities: true,
      entities: [__dirname + '/**/entities/*.{ts,js}'],
      synchronize: true,
    }),
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      graphiql: true,
      autoSchemaFile: true,
      subscription: true,
    }),
    CoffeeModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
