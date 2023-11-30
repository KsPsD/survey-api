import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, IsNumber } from 'class-validator';
import { CreateAnswerInput } from '../../answer/dto/answer.input';

@InputType()
class SurveyInputBase {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}
@InputType()
export class CreateSurveyInput extends SurveyInputBase {
  @Field()
  @IsString()
  title: string;
}
@InputType()
export class UpdateSurveyInput extends SurveyInputBase {}

@InputType()
export class CompleteSurveyInput extends SurveyInputBase {
  @Field(() => [CreateAnswerInput])
  answers: CreateAnswerInput[];
}
