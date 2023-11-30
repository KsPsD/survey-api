import { Module, forwardRef } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionResolver } from './question.resolver';
import { QuestionRepository } from './question.repository';
import { DatabaseModule } from '../database/database.module';
import { SurveyModule } from '../survey/survey.module';
@Module({
  imports: [DatabaseModule, forwardRef(() => SurveyModule)],
  providers: [QuestionService, QuestionResolver, ...QuestionRepository],
  exports: [QuestionService, ...QuestionRepository],
})
export class QuestionModule {}
