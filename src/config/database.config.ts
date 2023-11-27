import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'DO_NOT_USE_THIS_PASSWORD_IN_PRODUCTION',
    database: 'test_db',
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    synchronize: true,
};
