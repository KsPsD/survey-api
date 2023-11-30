import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AnswerService } from './answer.service';
import { Answer } from './answer.entity';
import { CreateAnswerInput, UpdateAnswerInput } from './dto/answer.input';
import { UseFilters } from '@nestjs/common';
import { GqlHttpExceptionFilter } from '../base/filters/gql-http-exception.filter';

@Resolver((of) => Answer)
@UseFilters(GqlHttpExceptionFilter)
export class AnswerResolver {
  constructor(private answerService: AnswerService) {}

  @Query((returns) => Answer)
  async getAnswer(@Args('id') id: number) {
    return this.answerService.findOne(id);
  }

  @Query((returns) => [Answer])
  async getAllAnswers() {
    return this.answerService.findAll();
  }

  @Mutation((returns) => Answer)
  async createAnswer(
    @Args('createAnswerInput') createAnswerInput: CreateAnswerInput,
  ) {
    return this.answerService.create(createAnswerInput);
  }

  @Mutation((returns) => Answer)
  async updateAnswer(
    @Args('id') id: number,
    @Args('updateAnswerInput')
    updateAnswerInput: UpdateAnswerInput,
  ) {
    return this.answerService.update(id, updateAnswerInput);
  }

  @Mutation((returns) => Boolean)
  async deleteAnswer(@Args('id') id: number) {
    return this.answerService.remove(id);
  }
}
