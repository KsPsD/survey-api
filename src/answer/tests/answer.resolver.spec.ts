import { Test, TestingModule } from '@nestjs/testing';
import { AnswerResolver } from '../answer.resolver';
import { AnswerService } from '../answer.service';

describe('AnswerResolver', () => {
  let resolver: AnswerResolver;
  let mockAnswerService;

  beforeEach(async () => {
    mockAnswerService = {
      findOne: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnswerResolver,
        {
          provide: AnswerService,
          useValue: mockAnswerService,
        },
      ],
    }).compile();

    resolver = module.get<AnswerResolver>(AnswerResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('get a answer for a given id', async () => {
    const answerId = 1;
    const expectedAnswer = { id: answerId, content: 'Test Answer' };
    mockAnswerService.findOne.mockResolvedValue(expectedAnswer);

    expect(await resolver.getAnswer(answerId)).toEqual(expectedAnswer);
    expect(mockAnswerService.findOne).toHaveBeenCalledWith(answerId);
  });

  it('get an array of answers', async () => {
    const answers = [{ id: 1, content: 'Test Answer' }];
    mockAnswerService.findAll.mockResolvedValue(answers);

    expect(await resolver.getAllAnswers()).toEqual(answers);
    expect(mockAnswerService.findAll).toHaveBeenCalled();
  });

  it('create a answer', async () => {
    const answerData = {
      questionId: 1,
      selectedOptionIds: [1],
    };
    const expectedAnswer = { id: 1, ...answerData };
    mockAnswerService.create.mockResolvedValue(expectedAnswer);

    expect(await resolver.createAnswer(answerData)).toEqual(expectedAnswer);
    expect(mockAnswerService.create).toHaveBeenCalledWith(answerData);
  });

  it('update a answer', async () => {
    const answerId = 1;
    const updateAnswerInput = { selectedOptionIds: [2] };
    const updatedAnswer = { id: answerId, ...updateAnswerInput };
    mockAnswerService.update.mockResolvedValue(updatedAnswer);

    expect(await resolver.updateAnswer(answerId, updateAnswerInput)).toEqual(
      updatedAnswer,
    );
    expect(mockAnswerService.update).toHaveBeenCalledWith(
      answerId,
      updateAnswerInput,
    );
  });
  it('delete a answer', async () => {
    const answerId = 1;
    mockAnswerService.remove.mockResolvedValue(true);

    expect(await resolver.deleteAnswer(answerId)).toEqual(true);
    expect(mockAnswerService.remove).toHaveBeenCalledWith(answerId);
  });
});
