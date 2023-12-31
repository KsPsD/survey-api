import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Question } from './question.entity';
import { CreateQuestionInput, UpdateQuestionInput } from './dto/question.input';
import { Survey, SurveyQuestion } from '../survey/survey.entity';

@Injectable()
export class QuestionService {
  constructor(
    @Inject('QUESTION_REPOSITORY')
    private questionRepository: Repository<Question>,
    @Inject('SURVEY_REPOSITORY')
    private surveyRepository: Repository<Survey>,
    @Inject('SURVEY_QUESTION_REPOSITORY')
    private surveyQuestionRepository: Repository<SurveyQuestion>,
  ) {}

  async create(
    createQuestionInput: CreateQuestionInput,
  ): Promise<Question[] | Question> {
    const { surveyIds, ...questionDetails } = createQuestionInput;

    const question = this.questionRepository.create(questionDetails);
    const savedQuestion = await this.questionRepository.save(question);

    if (surveyIds && surveyIds.length > 0) {
      const surveys = await this.surveyRepository.find({
        where: { id: In(surveyIds) },
      });
      if (surveys.length !== surveyIds.length) {
        throw new NotFoundException(`One or more surveys not found`);
      }

      const surveyQuestions = surveys.map((survey) => {
        return this.surveyQuestionRepository.create({
          survey: survey,
          question: savedQuestion,
        });
      });

      await this.surveyQuestionRepository.save(surveyQuestions);
    }

    return savedQuestion;
  }

  async findAll(): Promise<Question[]> {
    return this.questionRepository.find({
      relations: ['surveyQuestions', 'answers', 'options'],
    });
  }

  async findOne(id: number): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['surveyQuestions', 'answers', 'options'],
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
    await this.surveyQuestionRepository.delete({ question: { id } });

    const result = await this.questionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return true;
  }
}
