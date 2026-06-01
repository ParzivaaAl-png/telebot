import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Atlas Fleet Cosmic API is online and running!';
  }
}
