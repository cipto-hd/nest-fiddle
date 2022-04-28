import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CoffeeService } from './coffee.service';
import { CreateCoffeeDto } from './dtos/create-coffee.dto';
import { UpdateCoffeeDto } from './dtos/update-coffee.dto';
import { CoffeeEntity } from './entities/coffee.entity';

@Controller('coffees')
export class CoffeeController {
  constructor(private readonly coffeeService: CoffeeService) {}

  @Get()
  async getAll(): Promise<CoffeeEntity[]> {
    return this.coffeeService.getAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: number): Promise<CoffeeEntity | HttpException> {
    return this.coffeeService.getOne(id);
  }

  @Post()
  async create(
    @Body() createCoffeeDto: CreateCoffeeDto,
  ): Promise<CoffeeEntity> {
    return this.coffeeService.create(createCoffeeDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCoffeeDto: UpdateCoffeeDto,
    @Query('replaced') replaced: boolean,
  ): Promise<CoffeeEntity> {
    return this.coffeeService.update(id, updateCoffeeDto, replaced);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<CoffeeEntity> {
    return this.coffeeService.delete(id);
  }
}
