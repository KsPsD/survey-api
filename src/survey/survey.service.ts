import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository, EntityManager, DataSource, In } from 'typeorm';
import { Survey } from './survey.entity';
import {
  CompleteSurveyInput,
  CreateSurveyInput,
  UpdateSurveyInput,
} from './dto/survey.input';
import { Answer } from '../answer/answer.entity';
import { Question } from '../question/question.entity';
import { Option } from '../option/option.entity';
@Injectable()
export class SurveyService {
  private readonly logger = new Logger(SurveyService.name);
  constructor(
    @Inject('DATA_SOURCE')
    private dataSource: DataSource,
    @Inject('SURVEY_REPOSITORY')
    private surveyRepository: Repository<Survey>,
  ) {}

  async create(
    createSurveyInput: CreateSurveyInput,
  ): Promise<Survey[] | Survey> {
    const survey = this.surveyRepository.create(createSurveyInput);
    return this.surveyRepository.save(survey);
  }

  async findAll(): Promise<Survey[]> {
    return this.surveyRepository.find();
  }

  async findOne(id: number): Promise<Survey> {
    const survey = await this.surveyRepository.findOneBy({ id });
    if (!survey) {
      throw new NotFoundException(`Survey with ID ${id} not found`);
    }
    return survey;
  }

  async update(
    id: number,
    updateSurveyInput: UpdateSurveyInput,
  ): Promise<Survey> {
    const survey = await this.surveyRepository.findOneBy({ id });
    if (!survey) {
      throw new NotFoundException(`Survey with ID ${id} not found`);
    }
    await this.surveyRepository.update(id, updateSurveyInput);
    return this.surveyRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.surveyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Survey with ID ${id} not found`);
    }
    return true;
  }

  async completeSurvey(
    id: number,
    completeSurveyInput: CompleteSurveyInput,
  ): Promise<Boolean> {
    let isSuccess = false;
    await this.dataSource.transaction(async (manager: EntityManager) => {
      const { answers } = completeSurveyInput;
      const survey = await manager.findOne(Survey, { where: { id } });
      if (!survey) {
        throw new NotFoundException(`Survey with ID ${id} not found`);
      }
      const questionIds = answers.map((answer) => answer.questionId);
      const optionIds = answers.map((answer) => answer.selectedOptionId);

      const questions = await manager.find(Question, {
        where: { id: In(questionIds) },
      });
      const options = await manager.find(Option, {
        where: { id: In(optionIds) },
      });

      for (const answer of answers) {
        const { questionId, selectedOptionId } = answer;
        const question = questions.find((q) => q.id === questionId);
        const selectedOption = options.find((o) => o.id === selectedOptionId);

        if (!question || !selectedOption) {
          throw new NotFoundException(`Question or Option not found`);
        }

        const answerEntity = manager.create(Answer, {
          question,
          selectedOption,
        });

        await manager.save(answerEntity);
      }

      survey.isCompleted = true;

      await this.surveyRepository.save(survey);
      isSuccess = true;
    });
    this.logger.log(`Completed survey with ID ${id}`);
    return isSuccess;
  }
}
