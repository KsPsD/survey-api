import { Module, forwardRef } from '@nestjs/common';
import { OptionService } from './option.service';
import { OptionResolver } from './option.resolver';
import { OptionRepository } from './option.repository';
import { DatabaseModule } from '../database/database.module';
import { QuestionModule } from '../question/question.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => QuestionModule)],
  providers: [OptionService, OptionResolver, ...OptionRepository],
  exports: [OptionService, ...OptionRepository],
})
export class OptionModule {}
