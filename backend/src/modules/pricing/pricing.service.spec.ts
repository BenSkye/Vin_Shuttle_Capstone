import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { PRICING_CONFIG_REPOSITORY, VEHICLE_PRICING_REPOSITORY } from './pricing.di-token';

describe('PricingService', () => {
  let service: PricingService;
  let mockConfigRepo;
  let mockVehiclePricingRepo;

  beforeEach(async () => {
    mockConfigRepo = {
      findByServiceType: jest.fn(),
    };

    mockVehiclePricingRepo = {
      findVehiclePricing: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        {
          provide: PRICING_CONFIG_REPOSITORY,
          useValue: mockConfigRepo,
        },
        {
          provide: VEHICLE_PRICING_REPOSITORY,
          useValue: mockVehiclePricingRepo,
        },
      ],
    }).compile();

    service = module.get<PricingService>(PricingService);
  });

  describe('calculatePrice', () => {
    it('should throw error if service config not found', async () => {
      mockConfigRepo.findByServiceType.mockResolvedValue(null);

      await expect(service.calculatePrice('hourly', 'vehicle1', 100)).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Service config not found',
          },
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should throw error if vehicle pricing not found', async () => {
      mockConfigRepo.findByServiceType.mockResolvedValue({ _id: 'config1', base_unit: 1 });
      mockVehiclePricingRepo.findVehiclePricing.mockResolvedValue(null);

      await expect(service.calculatePrice('hourly', 'vehicle1', 100)).rejects.toThrow(
        new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Vehicle pricing not found',
          },
          HttpStatus.NOT_FOUND,
        ),
      );
    });

    it('should calculate price correctly for single tier', async () => {
      mockConfigRepo.findByServiceType.mockResolvedValue({
        _id: 'config1',
        base_unit: 1,
      });

      mockVehiclePricingRepo.findVehiclePricing.mockResolvedValue({
        tiered_pricing: [{ range: 0, price: 10000 }],
      });

      const price = await service.calculatePrice('hourly', 'vehicle1', 2);
      expect(price).toBe(20000); // 2 units * 10000
    });

    it('should calculate price correctly for multiple tiers', async () => {
      mockConfigRepo.findByServiceType.mockResolvedValue({
        _id: 'config1',
        base_unit: 10,
      });

      mockVehiclePricingRepo.findVehiclePricing.mockResolvedValue({
        tiered_pricing: [
          { range: 0, price: 100000 }, // 0-30: 100000 per 10 units
          { range: 30, price: 90000 }, // 30-60: 90000 per 10 units
          { range: 60, price: 80000 }, // 60+: 80000 per 10 units
        ],
      });

      const price = await service.calculatePrice('hourly', 'vehicle1', 70);

      // For 70 units with base_unit of 10:
      // - 10 units at 80000 = (70-60)/10 * 80000 = 80000
      // - 30 units at 90000 = (60-30)/10 * 90000 = 270000
      // - 30 units at 100000 = 30/10 * 100000 = 300000
      // Total: 650000
      expect(price).toBe(650000);
    });

    it('should handle base_unit calculations correctly', async () => {
      mockConfigRepo.findByServiceType.mockResolvedValue({
        _id: 'config1',
        base_unit: 5, // Changed base unit to 5
      });

      mockVehiclePricingRepo.findVehiclePricing.mockResolvedValue({
        tiered_pricing: [{ range: 0, price: 50000 }],
      });

      const price = await service.calculatePrice('hourly', 'vehicle1', 10);
      expect(price).toBe(100000); // (10/5) * 50000
    });
  });
});
