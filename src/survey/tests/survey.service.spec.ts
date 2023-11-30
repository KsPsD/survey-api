import { Test, TestingModule } from '@nestjs/testing';
import { SurveyService } from '../survey.service';
import { Survey } from '../survey.entity';
import { NotFoundException } from '@nestjs/common/exceptions';
import { Question } from '../../question/question.entity';
import { Option } from '../../option/option.entity';
import { In } from 'typeorm';

describe('SurveyService', () => {
  let service: SurveyService;
  let mockSurveyRepository;
  let mockDataSource;
  let managerMock;

  beforeEach(async () => {
    mockSurveyRepository = {
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      findOneBy: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
    };
    managerMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
    };
    mockDataSource = {
      transaction: jest.fn().mockImplementation((cb) => cb(managerMock)),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SurveyService,
        {
          provide: 'SURVEY_REPOSITORY',
          useValue: mockSurveyRepository,
        },
        {
          provide: 'DATA_SOURCE',
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<SurveyService>(SurveyService);
  });

  it('success create a survey', async () => {
    const surveyData = {
      title: 'Test Survey',
      description: 'Test Description',
      isCompleted: false,
    };
    mockSurveyRepository.create.mockReturnValue(surveyData);
    mockSurveyRepository.save.mockResolvedValue(surveyData);

    const result = await service.create(surveyData);

    expect(mockSurveyRepository.create).toHaveBeenCalledWith(surveyData);
    expect(mockSurveyRepository.save).toHaveBeenCalledWith(surveyData);
    expect(result).toEqual(surveyData);
  });

  it('success update a survey', async () => {
    const surveyId = 1;
    const updateData = { title: 'Updated Survey' };
    const existingSurvey = new Survey();
    existingSurvey.id = surveyId;
    existingSurvey.title = 'Original Title';

    mockSurveyRepository.findOneBy.mockResolvedValue(existingSurvey);
    mockSurveyRepository.update.mockImplementation(async () => {
      return {
        affected: 1,
      };
    });
    mockSurveyRepository.findOneBy.mockResolvedValue({
      ...existingSurvey,
      ...updateData,
    });

    const result = await service.update(surveyId, { ...updateData });

    expect(mockSurveyRepository.findOneBy).toHaveBeenCalledWith({
      id: surveyId,
    });
    expect(mockSurveyRepository.update).toHaveBeenCalledWith(surveyId, {
      ...updateData,
    });
    expect(result).toEqual({ ...existingSurvey, ...updateData });
  });

  it('failed update a survey', async () => {
    const surveyId = 1;
    const updateData = { title: 'Updated Survey' };
    const existingSurvey = new Survey();
    existingSurvey.id = surveyId;
    existingSurvey.title = 'Original Title';

    mockSurveyRepository.findOneBy.mockResolvedValue(existingSurvey);
    mockSurveyRepository.update.mockImplementation(async () => {
      return {
        affected: 0,
      };
    });

    try {
      await service.update(surveyId, { ...updateData });
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toEqual(`Survey with id ${surveyId} not found`);
    }
  });

  it('success remove a survey', async () => {
    const surveyId = 1;
    mockSurveyRepository.delete.mockResolvedValue({ affected: 1 });

    const result = await service.remove(surveyId);

    expect(mockSurveyRepository.delete).toHaveBeenCalledWith(surveyId);
    expect(result).toBeTruthy();
  });

  it('failed remove a survey', async () => {
    const surveyId = 1;
    mockSurveyRepository.delete.mockResolvedValue({ affected: 0 });

    try {
      await service.remove(surveyId);
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('success find all surveys', async () => {
    const expectedSurveys = [
      { id: 1, title: 'Test Survey 1' },
      { id: 2, title: 'Test Survey 2' },
    ];

    mockSurveyRepository.find.mockResolvedValue(expectedSurveys);

    const result = await service.findAll();

    expect(mockSurveyRepository.find).toHaveBeenCalled();
    expect(result).toEqual(expectedSurveys);
  });

  it('success find a survey by id', async () => {
    const surveyId = 1;
    const expectedSurvey = new Survey();
    expectedSurvey.id = surveyId;
    expectedSurvey.title = 'Test Survey';

    mockSurveyRepository.findOneBy.mockResolvedValue(expectedSurvey);

    const result = await service.findOne(surveyId);

    expect(mockSurveyRepository.findOneBy).toHaveBeenCalledWith({
      id: surveyId,
    });
    expect(result).toEqual(expectedSurvey);
  });

  it('successfully completes a survey', async () => {
    const surveyId = 1;
    const answers = [{ questionId: 1, selectedOptionId: 1 }];
    const survey = { id: surveyId, isCompleted: false };
    const questions = [{ id: 1 }];
    const options = [{ id: 1 }];

    managerMock.findOne.mockResolvedValue(survey);
    managerMock.find.mockImplementation((entity) => {
      if (entity === Question) {
        return Promise.resolve(questions);
      }
      if (entity === Option) {
        return Promise.resolve(options);
      }
    });

    const isSuccess = await service.completeSurvey(surveyId, { answers });

    expect(isSuccess).toBeTruthy();
    expect(managerMock.findOne).toHaveBeenCalledWith(Survey, {
      where: { id: surveyId },
    });
    expect(managerMock.find).toHaveBeenCalledWith(Question, {
      where: { id: In([1]) },
    });
    expect(managerMock.find).toHaveBeenCalledWith(Option, {
      where: { id: In([1]) },
    });
    expect(managerMock.save).toHaveBeenCalledTimes(1);
    expect(mockSurveyRepository.save).toHaveBeenCalledWith({
      id: surveyId,
      isCompleted: true,
    });
  });

  it('throws NotFoundException if survey not found', async () => {
    const surveyId = 1;
    const answers = [{ questionId: 1, selectedOptionId: 1 }];

    managerMock.findOne.mockResolvedValue(null);

    await expect(service.completeSurvey(surveyId, { answers })).rejects.toThrow(
      NotFoundException,
    );

    expect(managerMock.findOne).toHaveBeenCalledWith(Survey, {
      where: { id: surveyId },
    });
  });
});
