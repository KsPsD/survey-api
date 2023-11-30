import { Test, TestingModule } from '@nestjs/testing';
import { QuestionResolver } from '../question.resolver';
import { QuestionService } from '../question.service';

describe('QuestionResolver', () => {
  let resolver: QuestionResolver;
  let mockQuestionService;

  beforeEach(async () => {
    mockQuestionService = {
      findOne: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionResolver,
        {
          provide: QuestionService,
          useValue: mockQuestionService,
        },
      ],
    }).compile();

    resolver = module.get<QuestionResolver>(QuestionResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('get a question for a given id', async () => {
    const questionId = 1;
    const expectedQuestion = { id: questionId, content: 'Test Question' };
    mockQuestionService.findOne.mockResolvedValue(expectedQuestion);

    expect(await resolver.getQuestion(questionId)).toEqual(expectedQuestion);
    expect(mockQuestionService.findOne).toHaveBeenCalledWith(questionId);
  });

  it('get an array of questions', async () => {
    const questions = [{ id: 1, content: 'Test Question' }];
    mockQuestionService.findAll.mockResolvedValue(questions);

    expect(await resolver.getAllQuestions()).toEqual(questions);
    expect(mockQuestionService.findAll).toHaveBeenCalled();
  });

  it('create a question', async () => {
    const questionData = { content: 'Test Question', surveyIds: [1] };
    const expectedQuestion = { id: 1, ...questionData };
    mockQuestionService.create.mockResolvedValue(expectedQuestion);

    expect(await resolver.createQuestion(questionData)).toEqual(
      expectedQuestion,
    );
    expect(mockQuestionService.create).toHaveBeenCalledWith(questionData);
  });

  it('update a question', async () => {
    const questionId = 1;
    const updateQuestionInput = { content: 'Updated Question' };
    const updatedQuestion = { id: questionId, ...updateQuestionInput };
    mockQuestionService.update.mockResolvedValue(updatedQuestion);

    expect(
      await resolver.updateQuestion(questionId, updateQuestionInput),
    ).toEqual(updatedQuestion);
    expect(mockQuestionService.update).toHaveBeenCalledWith(
      questionId,
      updateQuestionInput,
    );
  });
  it('delete a question', async () => {
    const questionId = 1;
    mockQuestionService.remove.mockResolvedValue(true);

    expect(await resolver.deleteQuestion(questionId)).toEqual(true);
    expect(mockQuestionService.remove).toHaveBeenCalledWith(questionId);
  });
});
