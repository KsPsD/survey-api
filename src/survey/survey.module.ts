import { Module, forwardRef } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { SurveyResolver } from './survey.resolver';
import { SurveyRepository } from './survey.repository';
import { DatabaseModule } from '../database/database.module';
import { AnswerModule } from '../answer/answer.module';
@Module({
  imports: [DatabaseModule, forwardRef(() => AnswerModule)],
  providers: [SurveyService, SurveyResolver, ...SurveyRepository],
  exports: [SurveyService, ...SurveyRepository],
})
export class SurveyModule {}
