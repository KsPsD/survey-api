import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveyService } from './survey.service';
import { SurveyResolver } from './survey.resolver';
import { Survey } from './survey.entity';
import { SurveyRepository } from './survey.repository';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [SurveyService, SurveyResolver, ...SurveyRepository],
  exports: [SurveyService],
})
export class SurveyModule {}
