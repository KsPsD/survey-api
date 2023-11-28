import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
class QuestionInputBase {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  content?: string;
}
@InputType()
export class CreateQuestionInput extends QuestionInputBase {
  @Field()
  @IsString()
  content: string;
}
@InputType()
export class UpdateQuestionInput extends QuestionInputBase {}
