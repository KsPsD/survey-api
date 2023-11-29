import { Module } from '@nestjs/common';
import { OptionService } from './option.service';
import { OptionResolver } from './option.resolver';
import { OptionRepository } from './option.repository';
import { DatabaseModule } from '../database/database.module';
import { QuestionModule } from '../question/question.module';

@Module({
  imports: [DatabaseModule, QuestionModule],
  providers: [OptionService, OptionResolver, ...OptionRepository],
  exports: [OptionService, ...OptionRepository],
})
export class OptionModule {}
