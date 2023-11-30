import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SurveyService } from './survey.service';
import { Survey } from './survey.entity';
import {
  CompleteSurveyInput,
  CreateSurveyInput,
  UpdateSurveyInput,
} from './dto/survey.input';
import { UseFilters } from '@nestjs/common';
import { GqlHttpExceptionFilter } from '../base/filters/gql-http-exception.filter';

@Resolver((of) => Survey)
@UseFilters(GqlHttpExceptionFilter)
export class SurveyResolver {
  constructor(private surveyService: SurveyService) {}

  @Query((returns) => Survey)
  async getSurvey(@Args('id') id: number) {
    return this.surveyService.findOne(id);
  }

  @Query((returns) => [Survey])
  async getAllSurveys() {
    return this.surveyService.findAll();
  }

  @Mutation((returns) => Survey)
  async createSurvey(
    @Args('createSurveyInput') createSurveyInput: CreateSurveyInput,
  ) {
    return this.surveyService.create(createSurveyInput);
  }

  @Mutation((returns) => Survey)
  async updateSurvey(
    @Args('id') id: number,
    @Args('updateSurveyInput')
    { title, description, isCompleted }: UpdateSurveyInput,
  ) {
    return this.surveyService.update(id, { title, description, isCompleted });
  }

  @Mutation((returns) => Boolean)
  async deleteSurvey(@Args('id') id: number) {
    return this.surveyService.remove(id);
  }

  @Mutation((returns) => Boolean)
  async completeSurvey(
    @Args('id', { type: () => Int }) id: number,
    @Args('completeSurveyInput') completeSurveyInput: CompleteSurveyInput,
  ): Promise<Boolean> {
    return this.surveyService.completeSurvey(id, completeSurveyInput);
  }
}
