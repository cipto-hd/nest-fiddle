import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCoffeeDto {
  @Length(3, 25)
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @Length(3, 25)
  @IsString()
  @IsNotEmpty()
  readonly brand: string;

  @Length(3, 255, { each: true })
  @IsString({ each: true })
  @IsNotEmpty()
  readonly flavors: string[];
}
