import { BadRequestException } from '@nestjs/common';
import { ArgumentMetadata } from '@nestjs/common';
import { ParseIntPipe } from './parse-int.pipe';

describe('ParseIntPipe', () => {
  let pipe: ParseIntPipe;

  beforeEach(() => {
    pipe = new ParseIntPipe();
  });

  describe('transform', () => {
    it('should transform a string to an integer', () => {
      const result = pipe.transform('123', {} as ArgumentMetadata);
      expect(result).toEqual(123);
    });

    it('should throw BadRequestException when input is not a number', () => {
      expect(() => {
        pipe.transform('abc', {} as ArgumentMetadata);
      }).toThrow(BadRequestException);
    });
  });
});
