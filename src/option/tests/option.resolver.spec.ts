import { Test, TestingModule } from '@nestjs/testing';
import { OptionResolver } from '../option.resolver';
import { OptionService } from '../option.service';

describe('OptionResolver', () => {
  let resolver: OptionResolver;
  let mockOptionService;

  beforeEach(async () => {
    mockOptionService = {
      findOne: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OptionResolver,
        {
          provide: OptionService,
          useValue: mockOptionService,
        },
      ],
    }).compile();

    resolver = module.get<OptionResolver>(OptionResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('get a option for a given id', async () => {
    const optionId = 1;
    const expectedOption = { id: optionId, content: 'Test Option' };
    mockOptionService.findOne.mockResolvedValue(expectedOption);

    expect(await resolver.getOption(optionId)).toEqual(expectedOption);
    expect(mockOptionService.findOne).toHaveBeenCalledWith(optionId);
  });

  it('get an array of options', async () => {
    const options = [{ id: 1, content: 'Test Option' }];
    mockOptionService.findAll.mockResolvedValue(options);

    expect(await resolver.getAllOptions()).toEqual(options);
    expect(mockOptionService.findAll).toHaveBeenCalled();
  });

  it('create a option', async () => {
    const optionData = { content: 'Test Option', score: 1, questionId: 1 };
    const expectedOption = { id: 1, ...optionData };
    mockOptionService.create.mockResolvedValue(expectedOption);

    expect(await resolver.createOption(optionData)).toEqual(expectedOption);
    expect(mockOptionService.create).toHaveBeenCalledWith(optionData);
  });

  it('update a option', async () => {
    const optionId = 1;
    const updateOptionInput = { content: 'Updated Option' };
    const updatedOption = { id: optionId, ...updateOptionInput };
    mockOptionService.update.mockResolvedValue(updatedOption);

    expect(await resolver.updateOption(optionId, updateOptionInput)).toEqual(
      updatedOption,
    );
    expect(mockOptionService.update).toHaveBeenCalledWith(
      optionId,
      updateOptionInput,
    );
  });
  it('delete a option', async () => {
    const optionId = 1;
    mockOptionService.remove.mockResolvedValue(true);

    expect(await resolver.deleteOption(optionId)).toEqual(true);
    expect(mockOptionService.remove).toHaveBeenCalledWith(optionId);
  });
});
