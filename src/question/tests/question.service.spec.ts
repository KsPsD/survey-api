import { Test, TestingModule } from '@nestjs/testing';
import { QuestionService } from '../question.service';
import { Question } from '../question.entity';
import { NotFoundException } from '@nestjs/common/exceptions';

describe('QuestionService', () => {
  let service: QuestionService;
  let mockQuestionRepository;
  let mockSurveyRepository;

  beforeEach(async () => {
    mockQuestionRepository = {
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
    };
    mockSurveyRepository = {
      findOne: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionService,
        {
          provide: 'QUESTION_REPOSITORY',
          useValue: mockQuestionRepository,
        },
        {
          provide: 'SURVEY_REPOSITORY',
          useValue: mockSurveyRepository,
        },
      ],
    }).compile();

    service = module.get<QuestionService>(QuestionService);
  });

  it('success create a question', async () => {
    const questionData = {
      content: 'Test Question',
      surveyId: 1,
    };
    const mockSurvey = { id: questionData.surveyId, title: 'Test Survey' };
    const expectedQuestion = {
      ...questionData,
      survey: mockSurvey,
    };
    mockSurveyRepository.findOne.mockResolvedValue(mockSurvey);
    mockQuestionRepository.create.mockReturnValue(expectedQuestion);
    mockQuestionRepository.save.mockResolvedValue(expectedQuestion);

    const result = await service.create(questionData);

    expect(mockQuestionRepository.create).toHaveBeenCalledWith({
      content: questionData['content'],
      survey: mockSurvey,
    });
    expect(mockQuestionRepository.save).toHaveBeenCalledWith(expectedQuestion);
    expect(result).toEqual(expectedQuestion);
  });

  it('success update a question', async () => {
    const questionId = 1;
    const updateData = { content: 'Updated Question' };
    const existingQuestion = new Question();
    existingQuestion.id = questionId;
    existingQuestion.content = 'Original Title';

    mockQuestionRepository.findOne.mockResolvedValue(existingQuestion);
    mockQuestionRepository.update.mockImplementation(async () => {
      return {
        affected: 1,
      };
    });
    mockQuestionRepository.findOne.mockResolvedValue({
      ...existingQuestion,
      ...updateData,
    });

    const result = await service.update(questionId, { ...updateData });

    expect(mockQuestionRepository.findOne).toHaveBeenCalledWith({
      where: { id: questionId },
    });
    expect(mockQuestionRepository.update).toHaveBeenCalledWith(questionId, {
      ...updateData,
    });
    expect(result).toEqual({ ...existingQuestion, ...updateData });
  });

  it('failed update a question', async () => {
    const questionId = 1;
    const updateData = { content: 'Updated Question', surveyId: 1 };
    const existingQuestion = new Question();
    existingQuestion.id = questionId;
    existingQuestion.content = 'Original content';

    mockQuestionRepository.findOne.mockResolvedValue(existingQuestion);
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

  it('success find a question by id', async () => {
    const questionId = 1;
    const expectedQuestion = new Question();
    expectedQuestion.id = questionId;
    expectedQuestion.content = 'Test Question';

    mockQuestionRepository.findOne.mockResolvedValue(expectedQuestion);

    const result = await service.findOne(questionId);
    console.log(result);

    expect(mockQuestionRepository.findOne).toHaveBeenCalledWith({
      where: { id: questionId },
      relations: ['survey', 'answers', 'options'],
    });
    expect(result).toEqual(expectedQuestion);
  });
});
