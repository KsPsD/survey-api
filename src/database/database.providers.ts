import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'DO_NOT_USE_THIS_PASSWORD_IN_PRODUCTION',
        database: 'test_db',
        entities: [__dirname + '/../**/*.entity.{js,ts}'],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];
