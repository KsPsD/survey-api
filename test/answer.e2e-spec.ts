import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { GraphQLModule } from '@nestjs/graphql';
import { OptionModule } from '../src/option/option.module';
import { ApolloDriver } from '@nestjs/apollo';
import { DataSource, Repository } from 'typeorm';
import { Option } from '../src/option/option.entity';
import { Survey, SurveyQuestion } from '../src/survey/survey.entity';
import { SurveyModule } from '../src/survey/survey.module';
import { Question } from '../src/question/question.entity';
import { QuestionModule } from '../src/question/question.module';
import { Answer } from '../src/answer/answer.entity';
import { AnswerModule } from '../src/answer/answer.module';

describe('Option (e2e)', () => {
  let app: INestApplication;
  let optionRepository: Repository<Option>;
  let surveyRepository: Repository<Survey>;
  let questionRepository: Repository<Question>;
  let answerRepository: Repository<Answer>;
  let dataSource: DataSource;
  let surveyId: number;
  let mockSurvey: Survey;
  let mockQuestion: Question;
  let questionId: number;
  let optionId: number;
  let answerId: number;
  let surveyQuestionRepository: Repository<SurveyQuestion>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        OptionModule,
        SurveyModule,
        QuestionModule,
        AnswerModule,
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
    answerRepository =
      moduleFixture.get<Repository<Answer>>('ANSWER_REPOSITORY');
    surveyQuestionRepository = moduleFixture.get<Repository<SurveyQuestion>>(
      'SURVEY_QUESTION_REPOSITORY',
    );
    await app.init();
  });

  beforeEach(async () => {
    mockSurvey = surveyRepository.create({
      title: 'Test Survey',
      description: 'Description of Test Survey',
      isCompleted: false,
    });
    mockQuestion = questionRepository.create({
      content: 'Test Question',
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

    surveyId = savedSurvey.id;
    questionId = savedQuestion.id;

    const option = optionRepository.create({
      content: 'Original Content',
      score: 1,
      question: mockQuestion,
    });
    const savedOption = await optionRepository.save(option);
    optionId = savedOption.id;

    const answer = answerRepository.create({
      question: mockQuestion,
      selectedOptions: [savedOption],
    });
    const savedAnswer = await answerRepository.save(answer);
    answerId = savedAnswer.id;
  });

  afterAll(async () => {
    await app.close();
    await dataSource.destroy();
  });

  describe('GraphQL (POST /graphql)', () => {
    it('create a answer', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
          mutation {
            createAnswer(createAnswerInput: {
              questionId: ${questionId},
              selectedOptionIds: ${[optionId]}
            }) {
              id
            }
          }
          `,
        });

      if (response.status !== 200) {
        console.error('Unexpected status code:', response.status);
        console.error('Response body:', response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body.data.createAnswer).toEqual({
        id: expect.any(Number),
      });
    });

    it('update a answer', async () => {
      const option = optionRepository.create({
        content: 'Update Content',
        score: 1,
        question: mockQuestion,
      });
      const savedUpdateOption = await optionRepository.save(option);
      const updateOptionId = savedUpdateOption.id;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
          mutation {
            updateAnswer( id: ${answerId},updateAnswerInput: {
              selectedOptionIds: ${[updateOptionId]}
            }) {
              id
            }
          }
        `,
        });

      if (response.status !== 200) {
        console.error('Unexpected status code:', response.status);
        console.error('Response body:', response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body.data.updateAnswer).toEqual({
        id: answerId,
      });
    });

    it('get a answer by id', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
                query {
                  getAnswer(id: ${answerId}) {
                    id
                    question {
                      id
                    }
                    selectedOptions {
                      id
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
      expect(response.body.data.getAnswer).toEqual({
        id: answerId,
        question: {
          id: questionId,
        },
        selectedOptions: [
          {
            id: optionId,
          },
        ],
      });
    });

    it('get all answers', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
                query {
                  getAllAnswers {
                    id
                    question {
                      id
                    }
                    selectedOptions {
                      id
                    }
                  }
                }
              `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.getAllAnswers).toEqual(expect.any(Array));
        });
    });
    it('delete a option', async () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
                mutation {
                  deleteAnswer(id: ${answerId})
                }
              `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.deleteAnswer).toBe(true);
        });
    });
  });
});
