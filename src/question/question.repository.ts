import { Question } from './question.entity';
import { DataSource } from 'typeorm';

export const QuestionRepository = [
  {
    provide: 'QUESTION_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Question),
    inject: ['DATA_SOURCE'],
  },
];
