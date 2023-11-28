import { InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, IsNumber } from 'class-validator';

@InputType()
class SurveyInputBase {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}
@InputType()
export class CreateSurveyInput extends SurveyInputBase {
  @IsString()
  title: string;
}
@InputType()
export class UpdateSurveyInput extends SurveyInputBase {}
