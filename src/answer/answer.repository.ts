import { Answer } from './answer.entity';
import { DataSource } from 'typeorm';

export const AnswerRepository = [
  {
    provide: 'ANSWER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Answer),
    inject: ['DATA_SOURCE'],
  },
];
