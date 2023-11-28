import { Survey } from './survey.entity';
import { DataSource } from 'typeorm';

export const SurveyRepository = [
  {
    provide: 'SURVEY_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Survey),
    inject: ['DATA_SOURCE'],
  },
];
