import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { OptionService } from './option.service';
import { Option } from './option.entity';
import { CreateOptionInput, UpdateOptionInput } from './dto/option.input';

@Resolver((of) => Option)
export class OptionResolver {
  constructor(private optionService: OptionService) {}

  @Query((returns) => Option)
  async getOption(@Args('id') id: number) {
    return this.optionService.findOne(id);
  }

  @Query((returns) => [Option])
  async getAllOptions() {
    return this.optionService.findAll();
  }

  @Mutation((returns) => Option)
  async createOption(
    @Args('createOptionInput') createOptionInput: CreateOptionInput,
  ) {
    return this.optionService.create(createOptionInput);
  }

  @Mutation((returns) => Option)
  async updateOption(
    @Args('id') id: number,
    @Args('updateOptionInput')
    { content }: UpdateOptionInput,
  ) {
    return this.optionService.update(id, { content });
  }

  @Mutation((returns) => Boolean)
  async deleteOption(@Args('id') id: number) {
    return this.optionService.remove(id);
  }
}
