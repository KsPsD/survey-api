import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Question } from './question.entity';
import { CreateQuestionInput, UpdateQuestionInput } from './dto/question.input';
import { Survey } from '../survey/survey.entity';

@Injectable()
export class QuestionService {
  constructor(
    @Inject('QUESTION_REPOSITORY')
    private questionRepository: Repository<Question>,
    @Inject('SURVEY_REPOSITORY')
    private surveyRepository: Repository<Survey>,
  ) {}

  async create(
    createQuestionInput: CreateQuestionInput,
  ): Promise<Question[] | Question> {
    const { surveyId, ...questionDetails } = createQuestionInput;

    const survey = await this.surveyRepository.findOne({
      where: { id: surveyId },
    });
    if (!survey) {
      throw new NotFoundException(`Survey with id ${surveyId} not found`);
    }

    const question = this.questionRepository.create({
      ...questionDetails,
      survey,
    });

    return this.questionRepository.save(question);
  }

  async findAll(): Promise<Question[]> {
    return this.questionRepository.find({
      relations: ['survey', 'answers', 'options'],
    });
  }

  async findOne(id: number): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['survey', 'answers', 'options'],
    });
    if (!question) {
      throw new NotFoundException(`question with ID ${id} not found`);
    }
    return question;
  }

  async update(
    id: number,
    updateQuestionInput: UpdateQuestionInput,
  ): Promise<Question> {
    const question = await this.questionRepository.findOne({ where: { id } });
    if (!question) {
      throw new NotFoundException(`question with ID ${id} not found`);
    }
    await this.questionRepository.update(id, updateQuestionInput);
    return this.questionRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.questionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`question with ID ${id} not found`);
    }
    return true;
  }
}
