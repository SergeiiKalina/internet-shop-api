import { Module } from '@nestjs/common';
import { ColorService } from './color.service';
import { ColorController } from './color.controller';
import CommonModule from 'src/common.module';

@Module({
  imports: [CommonModule],
  controllers: [ColorController],
  providers: [ColorService],
})
export class ColorModule {}
