import { Test, TestingModule } from '@nestjs/testing';
import { NrelService } from './nrel.service';

describe('NrelService', () => {
  let service: NrelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NrelService],
    }).compile();

    service = module.get<NrelService>(NrelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
