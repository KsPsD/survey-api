import { Test, TestingModule } from '@nestjs/testing';
import { OptionService } from '../option.service';
import { Option } from '../option.entity';
import { NotFoundException } from '@nestjs/common/exceptions';

describe('OptionService', () => {
  let service: OptionService;
  let mockOptionRepository;
  let mockQuestionRepository;

  beforeEach(async () => {
    mockOptionRepository = {
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      findOneBy: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
    };
    mockQuestionRepository = {
      findOneBy: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OptionService,
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

    service = module.get<OptionService>(OptionService);
  });

  it('success create a option', async () => {
    const mockQuestionId = 1;
    const mockQuestion = { id: mockQuestionId, content: 'Test Question' };
    const optionData = {
      content: 'Test Option',
      score: 1,
      questionId: mockQuestionId,
    };

    mockQuestionRepository.findOneBy.mockResolvedValue(mockQuestion);

    mockOptionRepository.create.mockReturnValue({
      ...optionData,
      question: mockQuestion,
    });
    mockOptionRepository.save.mockResolvedValue({
      ...optionData,
      question: mockQuestion,
    });

    const result = await service.create(optionData);

    expect(mockQuestionRepository.findOneBy).toHaveBeenCalledWith({
      id: mockQuestionId,
    });

    expect(mockOptionRepository.create).toHaveBeenCalledWith({
      content: optionData['content'],
      score: optionData['score'],
      question: mockQuestion,
    });
    expect(mockOptionRepository.save).toHaveBeenCalledWith({
      ...optionData,
      question: mockQuestion,
    });

    expect(result).toEqual({
      ...optionData,
      question: mockQuestion,
    });
  });

  it('success update a option', async () => {
    const optionId = 1;
    const updateData = { content: 'Updated Option' };
    const existingOption = new Option();
    existingOption.id = optionId;
    existingOption.content = 'Original Title';

    mockOptionRepository.findOneBy.mockResolvedValue(existingOption);
    mockOptionRepository.update.mockImplementation(async () => {
      return {
        affected: 1,
      };
    });
    mockOptionRepository.findOneBy.mockResolvedValue({
      ...existingOption,
      ...updateData,
    });

    const result = await service.update(optionId, { ...updateData });

    expect(mockOptionRepository.findOneBy).toHaveBeenCalledWith({
      id: optionId,
    });
    expect(mockOptionRepository.update).toHaveBeenCalledWith(optionId, {
      ...updateData,
    });
    expect(result).toEqual({ ...existingOption, ...updateData });
  });

  it('failed update a option', async () => {
    const optionId = 1;
    const updateData = { content: 'Updated Option' };
    const existingOption = new Option();
    existingOption.id = optionId;
    existingOption.content = 'Original content';

    mockOptionRepository.findOneBy.mockResolvedValue(existingOption);
    mockOptionRepository.update.mockImplementation(async () => {
      return {
        affected: 0,
      };
    });

    try {
      await service.update(optionId, { ...updateData });
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toEqual(`Option with id ${optionId} not found`);
    }
  });

  it('success remove a option', async () => {
    const optionId = 1;
    mockOptionRepository.delete.mockResolvedValue({ affected: 1 });

    const result = await service.remove(optionId);

    expect(mockOptionRepository.delete).toHaveBeenCalledWith(optionId);
    expect(result).toBeTruthy();
  });

  it('failed remove a option', async () => {
    const optionId = 1;
    mockOptionRepository.delete.mockResolvedValue({ affected: 0 });

    try {
      await service.remove(optionId);
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('success find all options', async () => {
    const expectedOptions = [
      { id: 1, title: 'Test Option 1' },
      { id: 2, title: 'Test Option 2' },
    ];

    mockOptionRepository.find.mockResolvedValue(expectedOptions);

    const result = await service.findAll();

    expect(mockOptionRepository.find).toHaveBeenCalled();
    expect(result).toEqual(expectedOptions);
  });

  it('success find a option by id', async () => {
    const optionId = 1;
    const expectedOption = new Option();
    expectedOption.id = optionId;
    expectedOption.content = 'Test Option';

    mockOptionRepository.findOneBy.mockResolvedValue(expectedOption);

    const result = await service.findOne(optionId);

    expect(mockOptionRepository.findOneBy).toHaveBeenCalledWith({
      id: optionId,
    });
    expect(result).toEqual(expectedOption);
  });
});
