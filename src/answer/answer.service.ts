import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
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
    const { questionId, selectedOptionIds } = createAnswerInput;

    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });
    if (!question) {
      throw new NotFoundException(`Question with id ${questionId} not found`);
    }

    const options = await this.optionRepository.find({
      where: { id: In(selectedOptionIds) },
    });
    if (!options) {
      throw new NotFoundException(
        `Option with id ${selectedOptionIds} not found`,
      );
    }

    const answer = this.answerRepository.create({
      selectedOptions: options,
      question,
    });

    return this.answerRepository.save(answer);
  }

  async findAll(): Promise<Answer[]> {
    return this.answerRepository.find({
      relations: ['question', 'selectedOptions'],
    });
  }

  async findOne(id: number): Promise<Answer> {
    const answer = await this.answerRepository.findOne({
      where: { id },
      relations: ['question', 'selectedOptions'],
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

    if (updateAnswerInput.selectedOptionIds) {
      const options = await this.optionRepository.find({
        where: { id: In(updateAnswerInput.selectedOptionIds) },
      });
      if (!options) {
        throw new NotFoundException(
          `Option with ID ${updateAnswerInput.selectedOptionIds} not found`,
        );
      }
      answer.selectedOptions = options;
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
