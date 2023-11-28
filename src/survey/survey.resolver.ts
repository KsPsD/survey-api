import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { SurveyService } from './survey.service';
import { Survey } from './survey.entity';
import { CreateSurveyInput, UpdateSurveyInput } from './dto/survey.input';

@Resolver((of) => Survey)
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
}
