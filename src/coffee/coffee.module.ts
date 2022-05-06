import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from 'src/event/entities/event.entity';
import { CoffeeController } from './coffee.controller';
import { CoffeeService } from './coffee.service';
import { CoffeeEntity } from './entities/coffee.entity';
import { FlavorEntity } from './entities/flavor.entity';
import { CoffeeRepository } from './repositories/coffee.repository';
import { FlavorRepository } from './repositories/flavor.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CoffeeEntity,
      CoffeeRepository,
      FlavorEntity,
      FlavorRepository,
      EventEntity,
    ]),
  ],
  controllers: [CoffeeController],
  providers: [CoffeeService],
  exports: [CoffeeService],
})
export class CoffeeModule {}
