import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform {
  transform(value: string) {
    /** actually params have been already transformed by global pipe transform */
    const val = parseInt(value, 10);

    if (isNaN(val)) {
      throw new BadRequestException(
        `Validation failed. ${value} is not a integer.`,
      );
    }
    return val;
  }
}
