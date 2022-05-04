import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { EventEntity } from 'src/event/entities/event.entity';
import { Connection } from 'typeorm';
import { CreateCoffeeDto } from './dtos/create-coffee.dto';
import { UpdateCoffeeDto } from './dtos/update-coffee.dto';
import { CoffeeEntity } from './entities/coffee.entity';
import { FlavorEntity } from './entities/flavor.entity';
import { CoffeeRepository } from './repositories/coffee.repository';
import { FlavorRepository } from './repositories/flavor.repository';

@Injectable()
export class CoffeeService {
  constructor(
    // @InjectRepository(CoffeeEntity)
    private readonly coffeeRepository: CoffeeRepository,
    private readonly flavorRepository: FlavorRepository,
    private readonly connection: Connection,
  ) {}

  async getAll(paginationQuery: PaginationQueryDto): Promise<CoffeeEntity[]> {
    const { limit, offset } = paginationQuery;

    return this.coffeeRepository.find({
      relations: ['flavors'],
      take: limit,
      skip: offset,
    });
  }

  async getOne(id: number): Promise<CoffeeEntity> {
    const coffee = await this.coffeeRepository.findOne(id, {
      relations: ['flavors'],
    });
    if (!coffee)
      throw new NotFoundException(`Coffee with ID #${id} was not found`);

    return coffee;
  }

  async create(createCoffeeDto: CreateCoffeeDto): Promise<CoffeeEntity> {
    const flavors = await Promise.all(
      createCoffeeDto.flavors.map((name) =>
        this.preloadFlavorByName(name.trim()),
      ),
    );

    return this.coffeeRepository.save({ ...createCoffeeDto, flavors });
  }

  async update(
    id: number,
    updateCoffeeDto: UpdateCoffeeDto,
    replaced?: boolean,
  ): Promise<CoffeeEntity> {
    const coffee = await this.getOne(id);
    let coffeeUpdateData: CoffeeEntity;
    let updateCoffeeNonFlavorsDto: { name?: string; brand?: string };

    if (updateCoffeeDto.name)
      updateCoffeeNonFlavorsDto.name = updateCoffeeDto.name;
    if (updateCoffeeDto.name)
      updateCoffeeNonFlavorsDto.name = updateCoffeeDto.name;

    if (updateCoffeeDto.flavors) {
      let flavorUpdateData: FlavorEntity[] = [{} as FlavorEntity];

      flavorUpdateData =
        updateCoffeeDto.flavors &&
        (await Promise.all(
          updateCoffeeDto.flavors.map((name) =>
            this.preloadFlavorByName(name.trim()),
          ),
        ));

      if (replaced) {
        coffeeUpdateData = {
          ...coffee,
          flavors: flavorUpdateData,
        } as CoffeeEntity;
      } else {
        let flavorMergedData: FlavorEntity[] = [{} as FlavorEntity];
        flavorMergedData = coffee.flavors;

        const intialIDs = new Set(flavorMergedData.map((flavor) => flavor.id));

        flavorUpdateData.forEach((flavor) => {
          !intialIDs.has(flavor.id) && flavorMergedData.push(flavor);
        });

        coffeeUpdateData = {
          ...coffee,
          flavors: flavorMergedData,
        } as CoffeeEntity;
      }
    }

    return await this.coffeeRepository.save({
      ...coffeeUpdateData,
      ...updateCoffeeNonFlavorsDto,
    } as CoffeeEntity);
  }

  async delete(id: number): Promise<CoffeeEntity> {
    const coffee = await this.getOne(id);

    return this.coffeeRepository.remove(coffee);
  }

  private async preloadFlavorByName(name: string): Promise<FlavorEntity> {
    const existingFlavor = await this.flavorRepository.findOne({ name });
    if (existingFlavor) return existingFlavor;

    return this.flavorRepository.create({ name });
  }

  async recommendCoffee(coffee: CoffeeEntity) {
    const queryRunner = this.connection.createQueryRunner();
    queryRunner.connect();
    queryRunner.startTransaction();

    try {
      coffee.recommendations++;
      const recommendEvent = new EventEntity();
      recommendEvent.name = 'recommend_event';
      recommendEvent.type = EventEntity.name;
      recommendEvent.payload = { coffeeId: coffee.id };

      await queryRunner.manager.save(coffee);
      await queryRunner.manager.save(recommendEvent);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
