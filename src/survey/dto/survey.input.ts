import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, IsNumber } from 'class-validator';

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
