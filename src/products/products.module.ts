import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ConfigModule } from '@nestjs/config';
import CommonModule from 'src/common.module';

@Module({
  imports: [CommonModule, ConfigModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
