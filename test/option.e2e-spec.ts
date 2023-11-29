import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { GraphQLModule } from '@nestjs/graphql';
import { OptionModule } from '../src/option/option.module';
import { ApolloDriver } from '@nestjs/apollo';
import { DataSource, Repository } from 'typeorm';
import { Option } from '../src/option/option.entity';
import { Survey } from '../src/survey/survey.entity';
import { SurveyModule } from '../src/survey/survey.module';
import { Question } from '../src/question/question.entity';
import { QuestionModule } from '../src/question/question.module';

describe('Option (e2e)', () => {
  let app: INestApplication;
  let optionRepository: Repository<Option>;
  let surveyRepository: Repository<Survey>;
  let questionRepository: Repository<Question>;
  let dataSource: DataSource;
  let surveyId: number;
  let mockSurvey: Survey;
  let mockQuestion: Question;
  let questionId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        OptionModule,
        SurveyModule,
        QuestionModule,
        GraphQLModule.forRoot({
          driver: ApolloDriver,
          autoSchemaFile: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    dataSource = moduleFixture.get<DataSource>('DATA_SOURCE');
    optionRepository =
      moduleFixture.get<Repository<Option>>('OPTION_REPOSITORY');
    surveyRepository =
      moduleFixture.get<Repository<Survey>>('SURVEY_REPOSITORY');
    questionRepository = moduleFixture.get<Repository<Question>>(
      'QUESTION_REPOSITORY',
    );
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

    mockQuestion = questionRepository.create({
      content: 'Test Question',
      survey: mockSurvey,
    });
    const savedQuestion = await questionRepository.save(mockQuestion);
    questionId = savedQuestion.id;
  });

  afterAll(async () => {
    await app.close();
    await dataSource.destroy();
  });

  describe('GraphQL (POST /graphql)', () => {
    it('create a option', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
          mutation {
            createOption(createOptionInput: {
              content: "Test Option",
              score: 1,
              questionId: ${questionId}
            }) {
              id
              content
            }
          }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createOption).toEqual({
            id: expect.any(Number),
            content: 'Test Option',
          });
        });
    });

    it('update a option', async () => {
      const option = optionRepository.create({
        content: 'Original Content',
        score: 1,
        question: mockQuestion,
      });
      const savedOption = await optionRepository.save(option);
      const optionId = savedOption.id;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
        mutation {
          updateOption( id: ${optionId},updateOptionInput: {
            content: "Updated option content"
          }) {
            id
            content
            score
          }
        }
      `,
        });

      if (response.status !== 200) {
        console.error('Unexpected status code:', response.status);
        console.error('Response body:', response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body.data.updateOption).toEqual({
        id: optionId,
        content: 'Updated option content',
        score: 1,
      });
    });

    it('get a option by id', async () => {
      const option = optionRepository.create({
        content: 'Original Content',
        score: 1,
        question: mockQuestion,
      });
      const savedOption = await optionRepository.save(option);
      const optionId = savedOption.id;
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
              query {
                getOption(id: ${optionId}) {
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
      expect(response.body.data.getOption).toEqual({
        id: optionId,
        content: 'Original Content',
      });
    });

    it('get all options', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
              query {
                getAllOptions {
                  id
                  content
                }
              }
            `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.getAllOptions).toEqual(expect.any(Array));
        });
    });
    it('delete a option', async () => {
      const option = optionRepository.create({
        content: 'Original Content',
        score: 1,
        question: mockQuestion,
      });
      const savedOption = await optionRepository.save(option);
      const optionId = savedOption.id;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
              mutation {
                deleteOption(id: ${optionId})
              }
            `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.deleteOption).toBe(true);
        });
    });
  });
});
