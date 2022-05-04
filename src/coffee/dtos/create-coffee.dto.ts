import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCoffeeDto {
  @ApiProperty({
    description: 'The name of a coffee',
  })
  @Length(3, 25)
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    description: 'The brand of a coffee',
  })
  @Length(3, 25)
  @IsString()
  @IsNotEmpty()
  readonly brand: string;

  @ApiProperty({
    example: [],
  })
  @Length(3, 255, { each: true })
  @IsString({ each: true })
  @IsNotEmpty()
  readonly flavors: string[];
}
