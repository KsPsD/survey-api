import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { GraphQLModule } from '@nestjs/graphql';
import { SurveyModule } from '../src/survey/survey.module';
import { ApolloDriver } from '@nestjs/apollo';
import { DataSource, Repository } from 'typeorm';
import { Survey } from '../src/survey/survey.entity';

describe('App (e2e)', () => {
  let app: INestApplication;
  let surveyRepository: Repository<Survey>;
  let dataSource: DataSource;
  let testSurveyId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        SurveyModule,
        GraphQLModule.forRoot({
          driver: ApolloDriver,
          autoSchemaFile: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get<DataSource>('DATA_SOURCE');
    surveyRepository =
      moduleFixture.get<Repository<Survey>>('SURVEY_REPOSITORY');

    await app.init();
  });

  let firstSurveyId: number;
  beforeEach(async () => {
    const surveys = surveyRepository.create({
      title: 'Test Survey',
      description: 'Description of Test Survey',
      isCompleted: false,
    });
    const savedSurvey = await surveyRepository.save(surveys);
    testSurveyId = savedSurvey.id;
  });

  afterAll(async () => {
    await app.close();
    await dataSource.destroy();
  });

  describe('GraphQL (POST /graphql)', () => {
    it('create a survey', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              createSurvey(createSurveyInput: {
                title: "Test Survey",
                description: "Test Description",
                isCompleted: false
              }) {
                id
                title
                description
                isCompleted
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createSurvey).toEqual({
            id: expect.any(Number),
            title: 'Test Survey',
            description: 'Test Description',
            isCompleted: false,
          });
        });
    });

    it('update a survey', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
              mutation {
                updateSurvey(id: ${testSurveyId}, updateSurveyInput: {
                  title: "Updated Survey"
                }) {
                  id
                  title
                  description
                  isCompleted
                }
              }
            `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.updateSurvey).toEqual({
            id: testSurveyId,
            title: 'Updated Survey',
            description: expect.any(String),
            isCompleted: expect.any(Boolean),
          });
        });
    });

    it('get all surveys', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
              query {
                getAllSurveys {
                  id
                  title
                  description
                  isCompleted
                }
              }
            `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.getAllSurveys).toEqual(expect.any(Array));
        });
    });

    it('get a survey by id', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
              query {
                getSurvey(id: ${testSurveyId}) {
                  id
                  title
                  description
                  isCompleted
                }
              }
            `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.getSurvey).toEqual({
            id: testSurveyId,
            title: expect.any(String),
            description: expect.any(String),
            isCompleted: expect.any(Boolean),
          });
        });
    });

    it('delete a survey', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
              mutation {
                deleteSurvey(id: ${testSurveyId})
              }
            `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.deleteSurvey).toBe(true);
        });
    });
  });
});
