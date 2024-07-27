import { Module } from '@nestjs/common';
import { SizeService } from './size.service';
import { SizeController } from './size.controller';
import CommonModule from 'src/common.module';

@Module({
  imports: [CommonModule],
  controllers: [SizeController],
  providers: [SizeService],
})
export class SizeModule {}
