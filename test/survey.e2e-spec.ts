import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { GraphQLModule } from '@nestjs/graphql';
import { SurveyModule } from '../src/survey/survey.module';
import { ApolloDriver } from '@nestjs/apollo';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Survey, SurveyQuestion } from '../src/survey/survey.entity';
import { OptionModule } from '../src/option/option.module';
import { QuestionModule } from '../src/question/question.module';
import { Option } from '../src/option/option.entity';
import { Question } from '../src/question/question.entity';
import { DatabaseModule } from '../src/database/database.module';

describe('App (e2e)', () => {
  let app: INestApplication;
  let surveyRepository: Repository<Survey>;
  let dataSource: DataSource;
  let testSurveyId: number;
  let optionRepository: Repository<Option>;
  let questionRepository: Repository<Question>;
  let surveyQuestionRepository: Repository<SurveyQuestion>;
  let mockSurvey: Survey;
  let mockQuestion: Question;
  let mockOption: Option;
  let questionId: number;
  let optionId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        OptionModule,
        QuestionModule,
        SurveyModule,
        GraphQLModule.forRoot({
          driver: ApolloDriver,
          autoSchemaFile: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>('DATA_SOURCE');
    surveyRepository =
      moduleFixture.get<Repository<Survey>>('SURVEY_REPOSITORY');
    optionRepository =
      moduleFixture.get<Repository<Option>>('OPTION_REPOSITORY');
    questionRepository = moduleFixture.get<Repository<Question>>(
      'QUESTION_REPOSITORY',
    );
    surveyQuestionRepository = moduleFixture.get<Repository<SurveyQuestion>>(
      'SURVEY_QUESTION_REPOSITORY',
    );
  });

  beforeEach(async () => {
    mockSurvey = surveyRepository.create({
      title: 'Test Survey',
      description: 'Description of Test Survey',
      isCompleted: false,
    });

    mockQuestion = questionRepository.create({
      content: 'Test Question',
      surveyQuestions: [{ survey: mockSurvey }],
    });

    const mockSurveyQuestion = surveyQuestionRepository.create({
      survey: mockSurvey,
      question: mockQuestion,
    });

    const savedSurveyQuestion =
      await surveyQuestionRepository.save(mockSurveyQuestion);

    mockSurvey.surveyQuestions = [savedSurveyQuestion];
    mockQuestion.surveyQuestions = [savedSurveyQuestion];

    const savedSurvey = await surveyRepository.save(mockSurvey);
    const savedQuestion = await questionRepository.save(mockQuestion);
    questionId = savedQuestion.id;
    testSurveyId = savedSurvey.id;

    mockOption = optionRepository.create({
      content: 'Original Content',
      score: 1,
      question: mockQuestion,
    });
    const savedOption = await optionRepository.save(mockOption);
    optionId = savedOption.id;
  });

  afterAll(async () => {
    await app.close();
    await dataSource.synchronize(true);

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
    it('complete a survey', async () => {
      const mockQuestion2 = questionRepository.create({
        content: 'Test Question 2',
        surveyQuestions: [{ survey: mockSurvey }],
      });
      const mockSurveyQuestion2 = surveyQuestionRepository.create({
        survey: mockSurvey,
        question: mockQuestion2,
      });
      const savedSurveyQuestion2 =
        await surveyQuestionRepository.save(mockSurveyQuestion2);
      mockQuestion2.surveyQuestions = [savedSurveyQuestion2];
      mockSurvey.surveyQuestions.push(savedSurveyQuestion2);
      await surveyRepository.save(mockSurvey);
      const question2 = await questionRepository.save(mockQuestion2);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              completeSurvey(id: ${testSurveyId}, completeSurveyInput: {
                answers: [
                  {
                    questionId: ${questionId},
                    selectedOptionIds: ${[optionId]}
                  }
                  {
                    questionId: ${question2.id},
                    selectedOptionIds: ${[optionId]}
                  }
                ]
              })
            }
          `,
        });

      if (response.status !== 200) {
        console.error('Unexpected status code:', response.status);
        console.error('Response body:', response.body);
      }
      expect(response.status).toBe(200);
      const res = await surveyRepository.findOne({
        where: { id: testSurveyId },
        relations: ['answers', 'answers.selectedOptions'],
      });
      expect(res.answers.length).toBe(2);
      expect(response.body.data.completeSurvey).toBe(true);
    });

    it('should rollback transaction on failure', async () => {
      const invalidQuestionId = 999;
      const invalidOptionId = 999;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              completeSurvey(id: ${testSurveyId}, completeSurveyInput: {
                answers: [
                  {
                    questionId: ${invalidQuestionId},
                    selectedOptionIds: ${[invalidOptionId]}
                  }
                ]
              })
            }
          `,
        });

      const error = response.body.errors[0];
      expect(error.message).toBeDefined();
      expect(error.extensions.code).toBe('NOT_FOUND');
      expect(error.extensions.httpStatusCode).toBe(404);

      const survey = await surveyRepository.findOneBy({ id: testSurveyId });
      expect(survey.isCompleted).toBe(false);
    });

    it('All process complete survey and calculate total score of a survey', async () => {
      let response = await request(app.getHttpServer())
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
            }
          }
        `,
        });

      const surveyId = response.body.data.createSurvey.id;
      response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              createQuestion(createQuestionInput: {
                content: "Test Question"
                surveyIds: [${surveyId}]
              }) {
                id
              }
            }
          `,
        });

      const questionId = response.body.data.createQuestion.id;

      response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              createOption(createOptionInput: {
                content: "Test Option",
                score: 10,
                questionId: ${questionId}
              }) {
                id
              }
            }
          `,
        });
      const optionId = response.body.data.createOption.id;

      await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              completeSurvey(id: ${surveyId}, completeSurveyInput: {
                answers: [
                  {
                    questionId: ${questionId},
                    selectedOptionIds: ${[optionId]}
                  }
                ]
              })
            }
          `,
        });

      response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              getCompletedSurveys{
                id
                title
                description
                isCompleted
              }
            }
          `,
        });

      expect(response.status).toBe(200);

      response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              getSurveyTotalScore(id: ${surveyId})
            }
          `,
        });

      if (response.status !== 200) {
        console.error('Unexpected status code:', response.status);
        console.error('Response body:', response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body.data.getSurveyTotalScore).toBe(10);
    });
  });
});
