import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Question } from './question.entity';
import { CreateQuestionInput, UpdateQuestionInput } from './dto/question.input';

@Injectable()
export class QuestionService {
  constructor(
    @Inject('QUESTION_REPOSITORY')
    private questionRepository: Repository<Question>,
  ) {}

  async create(
    createQuestionInput: CreateQuestionInput,
  ): Promise<Question[] | Question> {
    const question = this.questionRepository.create(createQuestionInput);
    return this.questionRepository.save(question);
  }

  async findAll(): Promise<Question[]> {
    return this.questionRepository.find();
  }

  async findOne(id: number): Promise<Question> {
    const question = await this.questionRepository.findOneBy({ id });
    if (!question) {
      throw new NotFoundException(`question with ID ${id} not found`);
    }
    return question;
  }

  async update(
    id: number,
    updateQuestionInput: UpdateQuestionInput,
  ): Promise<Question> {
    const question = await this.questionRepository.findOneBy({ id });
    if (!question) {
      throw new NotFoundException(`question with ID ${id} not found`);
    }
    await this.questionRepository.update(id, updateQuestionInput);
    return this.questionRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.questionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`question with ID ${id} not found`);
    }
    return true;
  }
}