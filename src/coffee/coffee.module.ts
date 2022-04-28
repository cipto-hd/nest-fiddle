import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoffeeController } from './coffee.controller';
import { CoffeeService } from './coffee.service';
import { CoffeeEntity } from './entities/coffee.entity';
import { CoffeeRepository } from './repositories/coffee.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CoffeeEntity, CoffeeRepository])],
  controllers: [CoffeeController],
  providers: [CoffeeService],
})
export class CoffeeModule {}
