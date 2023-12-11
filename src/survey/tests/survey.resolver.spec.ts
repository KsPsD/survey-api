import { Test, TestingModule } from '@nestjs/testing';
import { SurveyResolver } from '../survey.resolver';
import { SurveyService } from '../survey.service';

describe('SurveyResolver', () => {
  let resolver: SurveyResolver;
  let mockSurveyService;

  beforeEach(async () => {
    mockSurveyService = {
      findOne: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      completeSurvey: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SurveyResolver,
        {
          provide: SurveyService,
          useValue: mockSurveyService,
        },
      ],
    }).compile();

    resolver = module.get<SurveyResolver>(SurveyResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('get a survey for a given id', async () => {
    const surveyId = 1;
    const expectedSurvey = { id: surveyId, title: 'Test Survey' };
    mockSurveyService.findOne.mockResolvedValue(expectedSurvey);

    expect(await resolver.getSurvey(surveyId)).toEqual(expectedSurvey);
    expect(mockSurveyService.findOne).toHaveBeenCalledWith(surveyId);
  });

  it('get an array of surveys', async () => {
    const surveys = [{ id: 1, title: 'Test Survey' }];
    mockSurveyService.findAll.mockResolvedValue(surveys);

    expect(await resolver.getAllSurveys()).toEqual(surveys);
    expect(mockSurveyService.findAll).toHaveBeenCalled();
  });

  it('create a survey', async () => {
    const surveyData = { title: 'Test Survey' };
    const expectedSurvey = { id: 1, ...surveyData };
    mockSurveyService.create.mockResolvedValue(expectedSurvey);

    expect(await resolver.createSurvey(surveyData)).toEqual(expectedSurvey);
    expect(mockSurveyService.create).toHaveBeenCalledWith(surveyData);
  });

  it('update a survey', async () => {
    const surveyId = 1;
    const updateSurveyInput = { title: 'Updated Survey' };
    const updatedSurvey = { id: surveyId, ...updateSurveyInput };
    mockSurveyService.update.mockResolvedValue(updatedSurvey);

    expect(await resolver.updateSurvey(surveyId, updateSurveyInput)).toEqual(
      updatedSurvey,
    );
    expect(mockSurveyService.update).toHaveBeenCalledWith(
      surveyId,
      updateSurveyInput,
    );
  });
  it('delete a survey', async () => {
    const surveyId = 1;
    mockSurveyService.remove.mockResolvedValue(true);

    expect(await resolver.deleteSurvey(surveyId)).toEqual(true);
    expect(mockSurveyService.remove).toHaveBeenCalledWith(surveyId);
  });

  it('complete a survey', async () => {
    const surveyId = 1;
    const completeSurveyInput = {
      answers: [
        { questionId: 1, selectedOptionIds: [1] },
        { questionId: 2, selectedOptionIds: [2] },
      ],
    };
    const expectedSurvey = { id: surveyId, ...completeSurveyInput };
    mockSurveyService.completeSurvey.mockResolvedValue(expectedSurvey);

    expect(
      await resolver.completeSurvey(surveyId, completeSurveyInput),
    ).toEqual(expectedSurvey);
    expect(mockSurveyService.completeSurvey).toHaveBeenCalledWith(
      surveyId,
      completeSurveyInput,
    );
  });
});
