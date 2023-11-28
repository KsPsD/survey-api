import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey } from './survey.entity';
import { CreateSurveyInput, UpdateSurveyInput } from './dto/survey.input';

@Injectable()
export class SurveyService {
  constructor(
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
}
