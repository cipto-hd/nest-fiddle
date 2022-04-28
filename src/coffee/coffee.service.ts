import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCoffeeDto } from './dtos/create-coffee.dto';
import { UpdateCoffeeDto } from './dtos/update-coffee.dto';
import { CoffeeEntity } from './entities/coffee.entity';
import { CoffeeRepository } from './repositories/coffee.repository';

@Injectable()
export class CoffeeService {
  constructor(
    // @InjectRepository(CoffeeEntity)
    private readonly coffeeRepository: CoffeeRepository,
  ) {}

  async getAll(): Promise<CoffeeEntity[]> {
    return this.coffeeRepository.find();
  }

  async getOne(id: number): Promise<CoffeeEntity> {
    const coffee = await this.coffeeRepository.findOne(id);
    if (!coffee) throw new NotFoundException();

    return coffee;
  }

  async create(createCoffeeDto: CreateCoffeeDto): Promise<CoffeeEntity> {
    let { flavors } = createCoffeeDto;
    flavors = flavors.map((x) => x.trim());

    return this.coffeeRepository.save({ ...createCoffeeDto, flavors });
  }

  async update(
    id: number,
    updateCoffeeDto: UpdateCoffeeDto,
    replaced: boolean,
  ): Promise<CoffeeEntity> {
    const coffee = await this.getOne(id);

    let { flavors } = updateCoffeeDto;
    flavors = flavors.map((x) => x.trim());
    if (replaced) flavors = [...new Set(flavors.concat(coffee.flavors))];

    return this.coffeeRepository.save({ ...updateCoffeeDto, flavors });
  }

  async delete(id: number): Promise<CoffeeEntity> {
    const coffee = await this.getOne(id);

    return this.coffeeRepository.remove(coffee);
  }
}
