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
    const surveys = await surveyRepository.find();
    if (surveys.length !== 0) {
      firstSurveyId = surveys[0].id;
    }
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
                updateSurvey(id: ${firstSurveyId}, updateSurveyInput: {
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
            id: firstSurveyId,
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
                getSurvey(id: ${firstSurveyId}) {
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
            id: firstSurveyId,
            title: expect.any(String),
            description: expect.any(String),
            isCompleted: expect.any(Boolean),
          });
        });
    });

    // it('delete a survey', () => {
    //   return request(app.getHttpServer())
    //     .post('/graphql')
    //     .send({
    //       query: `
    //           mutation {
    //             deleteSurvey(id: ${firstSurveyId})
    //           }
    //         `,
    //     })
    //     .expect(200)
    //     .expect((res) => {
    //       expect(res.body.data.deleteSurvey).toBe(true);
    //     });
    // });
  });
});
