import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { DeleteResult, UpdateResult } from 'typeorm';
import { CoffeeService } from './coffee.service';
import { CreateCoffeeDto } from './dtos/create-coffee.dto';
import { UpdateCoffeeDto } from './dtos/update-coffee.dto';
import { CoffeeEntity } from './entities/coffee.entity';

@Controller('coffees')
export class CoffeeController {
  constructor(private readonly coffeeService: CoffeeService) {}

  @Get()
  async getAll(): Promise<CoffeeEntity[]> {
    return await this.coffeeService.getAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: number): Promise<CoffeeEntity | any> {
    const coffee = await this.coffeeService.getOne(id);
    if (!coffee) return new NotFoundException();

    return coffee;
  }

  @Post()
  async create(
    @Body() createCoffeeDto: CreateCoffeeDto,
  ): Promise<CoffeeEntity> {
    return await this.coffeeService.create(createCoffeeDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCoffeeDto: UpdateCoffeeDto,
    @Query('replaced') replaced: boolean,
  ): Promise<UpdateResult> {
    return await this.coffeeService.update(id, updateCoffeeDto, replaced);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<DeleteResult> {
    return await this.coffeeService.delete(id);
  }
}
