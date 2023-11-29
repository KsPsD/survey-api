import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { GraphQLModule } from '@nestjs/graphql';
import { QuestionModule } from '../src/question/question.module';
import { ApolloDriver } from '@nestjs/apollo';
import { DataSource, Repository } from 'typeorm';
import { Question } from '../src/question/question.entity';
import { Survey } from '../src/survey/survey.entity';
import { SurveyModule } from '../src/survey/survey.module';

describe('Question (e2e)', () => {
  let app: INestApplication;
  let questionRepository: Repository<Question>;
  let surveyRepository: Repository<Survey>;
  let dataSource: DataSource;
  let surveyId: number;
  let mockSurvey: Survey;
  let questionId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        QuestionModule,
        SurveyModule,
        GraphQLModule.forRoot({
          driver: ApolloDriver,
          autoSchemaFile: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get<DataSource>('DATA_SOURCE');
    questionRepository = moduleFixture.get<Repository<Question>>(
      'QUESTION_REPOSITORY',
    );
    surveyRepository =
      moduleFixture.get<Repository<Survey>>('SURVEY_REPOSITORY');

    await app.init();
  });

  beforeEach(async () => {
    mockSurvey = surveyRepository.create({
      title: 'Test Survey',
      description: 'Description of Test Survey',
      isCompleted: false,
    });
    const savedSurvey = await surveyRepository.save(mockSurvey);
    surveyId = savedSurvey.id;

    const question = questionRepository.create({
      content: 'Original Content',
      survey: mockSurvey,
    });
    const savedQuestion = await questionRepository.save(question);
    questionId = savedQuestion.id;
  });

  afterAll(async () => {
    await app.close();
    await dataSource.destroy();
  });

  describe('GraphQL (POST /graphql)', () => {
    it('create a question', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
          mutation {
            createQuestion(createQuestionInput: {
              content: "Test Question",
              surveyId: ${surveyId}
            }) {
              id
              content
            }
          }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createQuestion).toEqual({
            id: expect.any(Number),
            content: 'Test Question',
          });
        });
    });

    it('update a question', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
        mutation {
          updateQuestion( id: ${questionId},updateQuestionInput: {
            content: "Updated question content"
          }) {
            id
            content
          }
        }
      `,
        });

      if (response.status !== 200) {
        console.error('Unexpected status code:', response.status);
        console.error('Response body:', response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body.data.updateQuestion).toEqual({
        id: questionId,
        content: 'Updated question content',
      });
    });

    it('get a question by id', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
              query {
                getQuestion(id: ${questionId}) {
                  id
                  content
                  survey{
                    id
                    title
                    description
                    isCompleted
                  }

                }
              }
            `,
        });

      if (response.status !== 200) {
        console.error('Unexpected status code:', response.status);
        console.error('Response body:', response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body.data.getQuestion).toEqual({
        id: questionId,
        content: 'Original Content',
        survey: {
          description: 'Description of Test Survey',
          isCompleted: false,
          title: 'Test Survey',
          id: surveyId,
        },
      });
    });

    it('get all questions', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
              query {
                getAllQuestions {
                  id
                  content
                }
              }
            `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.getAllQuestions).toEqual(expect.any(Array));
        });
    });
    it('delete a question', async () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
              mutation {
                deleteQuestion(id: ${questionId})
              }
            `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.deleteQuestion).toBe(true);
        });
    });
  });
});
