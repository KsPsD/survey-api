import { Module } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { SurveyResolver } from './survey.resolver';
import { SurveyRepository } from './survey.repository';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [SurveyService, SurveyResolver, ...SurveyRepository],
  exports: [SurveyService, ...SurveyRepository],
})
export class SurveyModule {}
