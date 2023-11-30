import { Module } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { AnswerResolver } from './answer.resolver';
import { AnswerRepository } from './answer.repository';
import { DatabaseModule } from '../database/database.module';
import { QuestionModule } from '../question/question.module';
import { OptionModule } from '../option/option.module';

@Module({
  imports: [DatabaseModule, QuestionModule, OptionModule],
  providers: [AnswerService, AnswerResolver, ...AnswerRepository],
  exports: [AnswerService, ...AnswerRepository],
})
export class AnswerModule {}
