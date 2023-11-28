import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveyService } from './survey.service';
import { SurveyResolver } from './survey.resolver';
import { Survey } from './survey.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Survey])],
  providers: [SurveyService, SurveyResolver],
  exports: [SurveyService],
})
export class SurveyModule {}
