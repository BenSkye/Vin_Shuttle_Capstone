import { Test, TestingModule } from '@nestjs/testing';
import { CarTrackingGateway } from './car-tracking.gateway';

describe('CarTrackingGateway', () => {
  let gateway: CarTrackingGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarTrackingGateway],
    }).compile();

    gateway = module.get<CarTrackingGateway>(CarTrackingGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
