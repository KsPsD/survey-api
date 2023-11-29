import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Answer } from './answer.entity';
import { CreateAnswerInput, UpdateAnswerInput } from './dto/answer.input';
import { Question } from '../question/question.entity';
import { Option } from '../option/option.entity';

@Injectable()
export class AnswerService {
  constructor(
    @Inject('ANSWER_REPOSITORY')
    private answerRepository: Repository<Answer>,
    @Inject('QUESTION_REPOSITORY')
    private questionRepository: Repository<Question>,
    @Inject('OPTION_REPOSITORY')
    private optionRepository: Repository<Option>,
  ) {}

  async create(createAnswerInput: CreateAnswerInput): Promise<Answer> {
    const { questionId, selectedOptionId } = createAnswerInput;

    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });
    if (!question) {
      throw new NotFoundException(`Question with id ${questionId} not found`);
    }

    const option = await this.optionRepository.findOne({
      where: { id: selectedOptionId },
    });
    if (!option) {
      throw new NotFoundException(
        `Option with id ${selectedOptionId} not found`,
      );
    }

    const answer = this.answerRepository.create({
      selectedOption: option,
      question,
    });

    return this.answerRepository.save(answer);
  }

  async findAll(): Promise<Answer[]> {
    return this.answerRepository.find({
      relations: ['question', 'selectedOption'],
    });
  }

  async findOne(id: number): Promise<Answer> {
    const answer = await this.answerRepository.findOne({
      where: { id },
      relations: ['question', 'selectedOption'],
    });
    if (!answer) {
      throw new NotFoundException(`answer with ID ${id} not found`);
    }
    return answer;
  }

  async update(
    id: number,
    updateAnswerInput: UpdateAnswerInput,
  ): Promise<Answer> {
    const answer = await this.answerRepository.findOne({ where: { id } });
    if (!answer) {
      throw new NotFoundException(`answer with ID ${id} not found`);
    }

    if (updateAnswerInput.questionId) {
      const question = await this.questionRepository.findOne({
        where: { id: updateAnswerInput.questionId },
      });

      if (!question) {
        throw new NotFoundException(
          `Question with ID ${updateAnswerInput.questionId} not found`,
        );
      }
      answer.question = question;
    }

    if (updateAnswerInput.selectedOptionId) {
      const option = await this.optionRepository.findOne({
        where: { id: updateAnswerInput.selectedOptionId },
      });
      if (!option) {
        throw new NotFoundException(
          `Option with ID ${updateAnswerInput.selectedOptionId} not found`,
        );
      }
      answer.selectedOption = option;
    }

    return this.answerRepository.save(answer);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.answerRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`answer with ID ${id} not found`);
    }
    return true;
  }
}
