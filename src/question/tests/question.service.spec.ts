import { Test, TestingModule } from '@nestjs/testing';
import { QuestionService } from '../question.service';
import { Question } from '../question.entity';
import { NotFoundException } from '@nestjs/common/exceptions';

describe('SurveyService', () => {
  let service: QuestionService;
  let mockQuestionRepository;

  beforeEach(async () => {
    mockQuestionRepository = {
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      findOneBy: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionService,
        {
          provide: 'QUESTION_REPOSITORY',
          useValue: mockQuestionRepository,
        },
      ],
    }).compile();

    service = module.get<QuestionService>(QuestionService);
  });

  it('success create a survey', async () => {
    const questionData = {
      content: 'Test Question',
    };
    mockQuestionRepository.create.mockReturnValue(questionData);
    mockQuestionRepository.save.mockResolvedValue(questionData);

    const result = await service.create(questionData);

    expect(mockQuestionRepository.create).toHaveBeenCalledWith(questionData);
    expect(mockQuestionRepository.save).toHaveBeenCalledWith(questionData);
    expect(result).toEqual(questionData);
  });

  it('success update a question', async () => {
    const questionId = 1;
    const updateData = { content: 'Updated Survey' };
    const existingQuestion = new Question();
    existingQuestion.id = questionId;
    existingQuestion.content = 'Original Title';

    mockQuestionRepository.findOneBy.mockResolvedValue(existingQuestion);
    mockQuestionRepository.update.mockImplementation(async () => {
      return {
        affected: 1,
      };
    });
    mockQuestionRepository.findOneBy.mockResolvedValue({
      ...existingQuestion,
      ...updateData,
    });

    const result = await service.update(questionId, { ...updateData });
    console.log(result);

    expect(mockQuestionRepository.findOneBy).toHaveBeenCalledWith({
      id: questionId,
    });
    expect(mockQuestionRepository.update).toHaveBeenCalledWith(questionId, {
      ...updateData,
    });
    expect(result).toEqual({ ...existingQuestion, ...updateData });
  });

  it('failed update a survey', async () => {
    const questionId = 1;
    const updateData = { content: 'Updated Question' };
    const existingQuestion = new Question();
    existingQuestion.id = questionId;
    existingQuestion.content = 'Original content';

    mockQuestionRepository.findOneBy.mockResolvedValue(existingQuestion);
    mockQuestionRepository.update.mockImplementation(async () => {
      return {
        affected: 0,
      };
    });

    try {
      await service.update(questionId, { ...updateData });
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toEqual(`Question with id ${questionId} not found`);
    }
  });

  it('success remove a question', async () => {
    const questionId = 1;
    mockQuestionRepository.delete.mockResolvedValue({ affected: 1 });

    const result = await service.remove(questionId);

    expect(mockQuestionRepository.delete).toHaveBeenCalledWith(questionId);
    expect(result).toBeTruthy();
  });

  it('failed remove a question', async () => {
    const questionId = 1;
    mockQuestionRepository.delete.mockResolvedValue({ affected: 0 });

    try {
      await service.remove(questionId);
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('success find all questions', async () => {
    const expectedQuestions = [
      { id: 1, title: 'Test Question 1' },
      { id: 2, title: 'Test Question 2' },
    ];

    mockQuestionRepository.find.mockResolvedValue(expectedQuestions);

    const result = await service.findAll();

    expect(mockQuestionRepository.find).toHaveBeenCalled();
    expect(result).toEqual(expectedQuestions);
  });

  it('success find a survey by id', async () => {
    const questionId = 1;
    const expectedQuestion = new Question();
    expectedQuestion.id = questionId;
    expectedQuestion.content = 'Test Question';

    mockQuestionRepository.findOneBy.mockResolvedValue(expectedQuestion);

    const result = await service.findOne(questionId);

    expect(mockQuestionRepository.findOneBy).toHaveBeenCalledWith({
      id: questionId,
    });
    expect(result).toEqual(expectedQuestion);
  });
});
