import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Main')
@Controller()
export class AppController {
  @Get('health_check')
  getHealthCheck() {
    return 'Ok!';
  }
}
