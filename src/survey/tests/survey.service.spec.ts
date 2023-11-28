import { Test, TestingModule } from '@nestjs/testing';
import { SurveyService } from '../survey.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Survey } from '../survey.entity';
import { NotFoundException } from '@nestjs/common/exceptions';
import { SurveyRepository } from '../survey.repository';

describe('SurveyService', () => {
  let service: SurveyService;
  let mockSurveyRepository;

  beforeEach(async () => {
    mockSurveyRepository = {
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      findOneBy: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SurveyService,
        {
          provide: 'SURVEY_REPOSITORY',
          useValue: mockSurveyRepository,
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
    console.log(result);

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
});
