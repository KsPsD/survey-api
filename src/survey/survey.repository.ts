import { Survey, SurveyQuestion } from './survey.entity';
import { DataSource } from 'typeorm';

export const SurveyRepository = [
  {
    provide: 'SURVEY_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Survey),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'SURVEY_QUESTION_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(SurveyQuestion),
    inject: ['DATA_SOURCE'],
  },
];
