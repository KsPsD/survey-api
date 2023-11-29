import { Test, TestingModule } from '@nestjs/testing';
import { AnswerService } from '../answer.service';
import { Answer } from '../answer.entity';
import { NotFoundException } from '@nestjs/common/exceptions';
import { Option } from '../../option/option.entity';

describe('AnswerService', () => {
  let service: AnswerService;
  let mockAnswerRepository;
  let mockQuestionRepository;
  let mockOptionRepository;

  beforeEach(async () => {
    mockOptionRepository = {
      findOne: jest.fn(),
    };
    mockQuestionRepository = {
      findOne: jest.fn(),
    };
    mockAnswerRepository = {
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnswerService,
        {
          provide: 'ANSWER_REPOSITORY',
          useValue: mockAnswerRepository,
        },
        {
          provide: 'OPTION_REPOSITORY',
          useValue: mockOptionRepository,
        },
        {
          provide: 'QUESTION_REPOSITORY',
          useValue: mockQuestionRepository,
        },
      ],
    }).compile();

    service = module.get<AnswerService>(AnswerService);
  });

  it('success create a answer', async () => {
    const mockQuestionId = 1;
    const selectedOptionId = 1;
    const mockQuestion = { id: mockQuestionId, content: 'Test Question' };
    const mockOption = { id: selectedOptionId, content: 'Test Option' };
    const answerData = {
      questionId: mockQuestionId,
      selectedOptionId: selectedOptionId,
    };

    mockQuestionRepository.findOne.mockResolvedValue(mockQuestion);
    mockOptionRepository.findOne.mockResolvedValue(mockOption);

    mockAnswerRepository.create.mockReturnValue({
      answerData,
    });
    mockAnswerRepository.save.mockResolvedValue({
      answerData,
    });

    const result = await service.create(answerData);

    expect(mockQuestionRepository.findOne).toHaveBeenCalledWith({
      where: { id: mockQuestionId },
    });

    expect(mockAnswerRepository.create).toHaveBeenCalledWith({
      selectedOption: mockOption,
      question: mockQuestion,
    });
    expect(mockAnswerRepository.save).toHaveBeenCalledWith({
      answerData,
    });

    expect(result).toEqual({
      answerData,
    });
  });

  it('success updating answer with selectedOptionId', async () => {
    const answerId = 1;
    const updateData = { selectedOptionId: 1 };
    const existingAnswer = {
      id: answerId,
    };
    const updatingOption = { id: 1, content: 'Updating Option' };

    mockAnswerRepository.findOne.mockResolvedValue(existingAnswer);
    mockOptionRepository.findOne.mockResolvedValue(updatingOption);
    mockAnswerRepository.save.mockResolvedValue({
      id: existingAnswer['id'],
      option: updatingOption,
    });

    const result = await service.update(answerId, { ...updateData });

    expect(mockAnswerRepository.findOne).toHaveBeenCalledWith({
      where: { id: answerId },
    });

    expect(mockAnswerRepository.save).toHaveBeenCalledWith({
      id: existingAnswer['id'],
      selectedOption: updatingOption,
    });
    expect(result).toEqual({
      id: existingAnswer['id'],
      option: updatingOption,
    });
  });

  it('success updating answer with questionId', async () => {
    const answerId = 1;
    const updateData = { questionId: 1 };
    const existingAnswer = {
      id: answerId,
    };
    const updatingQuestion = { id: 1, content: 'Updating Question' };

    mockAnswerRepository.findOne.mockResolvedValue(existingAnswer);
    mockQuestionRepository.findOne.mockResolvedValue(updatingQuestion);
    mockAnswerRepository.save.mockResolvedValue({
      id: existingAnswer['id'],
      question: updatingQuestion,
    });

    const result = await service.update(answerId, { ...updateData });

    expect(mockAnswerRepository.findOne).toHaveBeenCalledWith({
      where: { id: answerId },
    });

    expect(mockAnswerRepository.save).toHaveBeenCalledWith({
      id: existingAnswer['id'],
      question: updatingQuestion,
    });
    expect(result).toEqual({
      id: existingAnswer['id'],
      question: updatingQuestion,
    });
  });

  it('failed update a answer', async () => {
    const answerId = 1;
    const updateData = { selectedOptionId: 1 };
    const existingAnswer = new Answer();
    existingAnswer.id = answerId;

    mockAnswerRepository.findOne.mockResolvedValue(existingAnswer);
    mockAnswerRepository.update.mockImplementation(async () => {
      return {
        affected: 0,
      };
    });

    try {
      await service.update(answerId, { ...updateData });
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toEqual(`Option with ID ${answerId} not found`);
    }
  });

  it('success remove a answer', async () => {
    const answerId = 1;
    mockAnswerRepository.delete.mockResolvedValue({ affected: 1 });

    const result = await service.remove(answerId);

    expect(mockAnswerRepository.delete).toHaveBeenCalledWith(answerId);
    expect(result).toBeTruthy();
  });

  it('failed remove a answer', async () => {
    const answerId = 1;
    mockAnswerRepository.delete.mockResolvedValue({ affected: 0 });

    try {
      await service.remove(answerId);
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('success find all answers', async () => {
    const expectedAnswers = [
      { id: 1, title: 'Test Answer 1' },
      { id: 2, title: 'Test Answer 2' },
    ];

    mockAnswerRepository.find.mockResolvedValue(expectedAnswers);

    const result = await service.findAll();

    expect(mockAnswerRepository.find).toHaveBeenCalled();
    expect(result).toEqual(expectedAnswers);
  });

  it('success find a answer by id', async () => {
    const answerId = 1;
    const expectedAnswer = new Answer();
    expectedAnswer.id = answerId;

    mockAnswerRepository.findOne.mockResolvedValue(expectedAnswer);

    const result = await service.findOne(answerId);

    expect(mockAnswerRepository.findOne).toHaveBeenCalledWith({
      where: { id: answerId },
      relations: ['question', 'selectedOption'],
    });
    expect(result).toEqual(expectedAnswer);
  });
});
