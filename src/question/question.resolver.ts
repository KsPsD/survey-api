import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { QuestionService } from './question.service';
import { Question } from './question.entity';
import { CreateQuestionInput, UpdateQuestionInput } from './dto/question.input';
import { UseFilters } from '@nestjs/common';
import { GqlHttpExceptionFilter } from '../base/filters/gql-http-exception.filter';

@Resolver((of) => Question)
@UseFilters(GqlHttpExceptionFilter)
export class QuestionResolver {
  constructor(private questionService: QuestionService) {}

  @Query((returns) => Question)
  async getQuestion(@Args('id') id: number) {
    return this.questionService.findOne(id);
  }

  @Query((returns) => [Question])
  async getAllQuestions() {
    return this.questionService.findAll();
  }

  @Mutation((returns) => Question)
  async createQuestion(
    @Args('createQuestionInput') createQuestionInput: CreateQuestionInput,
  ) {
    return this.questionService.create(createQuestionInput);
  }

  @Mutation((returns) => Question)
  async updateQuestion(
    @Args('id') id: number,
    @Args('updateQuestionInput')
    { content }: UpdateQuestionInput,
  ) {
    return this.questionService.update(id, { content });
  }

  @Mutation((returns) => Boolean)
  async deleteQuestion(@Args('id') id: number) {
    return this.questionService.remove(id);
  }
}
