import { EntityRepository, Repository } from 'typeorm';
import { FlavorEntity } from '../entities/flavor.entity';

@EntityRepository(FlavorEntity)
export class FlavorRepository extends Repository<FlavorEntity> {}
