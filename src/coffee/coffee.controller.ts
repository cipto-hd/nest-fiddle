import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiForbiddenResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { ParseIntPipe } from 'src/common/pipes/parse-int.pipe';
import { CoffeeService } from './coffee.service';
import { CreateCoffeeDto } from './dtos/create-coffee.dto';
import { UpdateCoffeeDto } from './dtos/update-coffee.dto';
import { CoffeeEntity } from './entities/coffee.entity';

@ApiTags('coffees')
@Controller('coffees')
export class CoffeeController {
  constructor(private readonly coffeeService: CoffeeService) {}

  @ApiForbiddenResponse({
    description:
      'Route access is forbidden without api key in the authorization header.',
    content: {
      statusCode: {
        example: 403,
      },
      message: { example: 'Forbidden resource' },
      error: { example: 'Forbidden' },
      timestamp: { example: '2022-05-03T06:37:03.780Z' },
    },
  })
  @Get()
  async getAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<CoffeeEntity[]> {
    return this.coffeeService.getAll(paginationQuery);
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number): Promise<CoffeeEntity> {
    return this.coffeeService.getOne(id);
  }

  @Post()
  async create(
    @Body() createCoffeeDto: CreateCoffeeDto,
  ): Promise<CoffeeEntity> {
    return this.coffeeService.create(createCoffeeDto);
  }

  @ApiQuery({
    name: 'replaced',
    type: Boolean,
    description: 'A parameter. Optional',
    required: false,
  })
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCoffeeDto: UpdateCoffeeDto,
    @Query('replaced') replaced?: boolean,
  ): Promise<CoffeeEntity> {
    return this.coffeeService.update(id, updateCoffeeDto, replaced);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<CoffeeEntity> {
    return this.coffeeService.delete(id);
  }
}
