import { Option } from './option.entity';
import { DataSource } from 'typeorm';

export const OptionRepository = [
  {
    provide: 'OPTION_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Option),
    inject: ['DATA_SOURCE'],
  },
];
