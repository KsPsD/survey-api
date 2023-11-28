import { Module } from '@nestjs/common';
import { typeOrmConfig } from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { SurveyModule } from './survey/survey.module';
import { SurveyResolver } from './survey/survey.resolver';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
    SurveyModule,
  ],
  providers: [AppResolver],
})
export class AppModule {}
