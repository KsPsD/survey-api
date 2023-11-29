import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Option } from './option.entity';
import { CreateOptionInput, UpdateOptionInput } from './dto/option.input';
import { Question } from '../question/question.entity';

@Injectable()
export class OptionService {
  constructor(
    @Inject('OPTION_REPOSITORY')
    private optionRepository: Repository<Option>,
    @Inject('QUESTION_REPOSITORY')
    private questionRepository: Repository<Question>,
  ) {}

  async create(createOptionInput: CreateOptionInput): Promise<Option> {
    const { questionId, ...optionDetails } = createOptionInput;

    const question = await this.questionRepository.findOneBy({
      id: questionId,
    });
    if (!question) {
      throw new NotFoundException(`Question with id ${questionId} not found`);
    }

    const option = this.optionRepository.create({
      ...optionDetails,
      question,
    });

    return this.optionRepository.save(option);
  }

  async findAll(): Promise<Option[]> {
    return this.optionRepository.find();
  }

  async findOne(id: number): Promise<Option> {
    const option = await this.optionRepository.findOneBy({ id });
    if (!option) {
      throw new NotFoundException(`option with ID ${id} not found`);
    }
    return option;
  }

  async update(
    id: number,
    updateOptionInput: UpdateOptionInput,
  ): Promise<Option> {
    const option = await this.optionRepository.findOneBy({ id });
    if (!option) {
      throw new NotFoundException(`option with ID ${id} not found`);
    }
    await this.optionRepository.update(id, updateOptionInput);
    return this.optionRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.optionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`option with ID ${id} not found`);
    }
    return true;
  }
}
