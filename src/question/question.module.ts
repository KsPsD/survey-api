import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionResolver } from './question.resolver';
import { QuestionRepository } from './question.repository';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [QuestionService, QuestionResolver, ...QuestionRepository],
  exports: [QuestionService],
})
export class QuestionModule {}
