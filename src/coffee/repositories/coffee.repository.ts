import { EntityRepository, Repository } from 'typeorm';
import { CoffeeEntity } from '../entities/coffee.entity';

@EntityRepository(CoffeeEntity)
export class CoffeeRepository extends Repository<CoffeeEntity> {}
