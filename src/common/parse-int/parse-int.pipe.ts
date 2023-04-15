import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: string, metadata: ArgumentMetadata) {
    const param = parseInt(value, 10);
    if (isNaN(param)) {
      throw new BadRequestException(`${param} is not an number`);
    }
    return param;
  }
}
