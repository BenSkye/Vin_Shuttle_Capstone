import * as Joi from 'joi';
import { ServiceType } from 'src/share/enums';

export const PricingValidation = {
  createServiceConfig: Joi.object({
    service_type: Joi.string()
      .valid(...Object.values(ServiceType))
      .required(),
    base_unit: Joi.number().min(1).required(),
    base_unit_type: Joi.string().valid('minute', 'km').required(),
  }),

  createVehiclePricing: Joi.object({
    vehicle_category: Joi.string().hex().length(24).required(),
    service_config: Joi.string().hex().length(24).required(),
    tiered_pricing: Joi.array()
      .items(
        Joi.object({
          range: Joi.number().min(0).required(),
          price: Joi.number().min(0).required(),
        }),
      )
      .min(1)
      .required(),
  }),

  createBusRoutePricing: Joi.object({
    vehicle_category: Joi.string().hex().length(24).required(),
    tiered_pricing: Joi.array()
      .items(
        Joi.object({
          range: Joi.number().min(0).required(),
          price: Joi.number().min(0).required(),
        }),
      )
      .min(1)
      .custom((value, helpers) => {
        // check if there is a price tier starting from 0 km
        if (!value.some(tier => tier.range === 0)) {
          return helpers.error('Must have a price tier starting from 0 km');
        }
        // check if the price tiers are increasing
        const sortedTiers = [...value].sort((a, b) => a.range - b.range);
        for (let i = 1; i < sortedTiers.length; i++) {
          if (sortedTiers[i].range <= sortedTiers[i - 1].range) {
            return helpers.error('Price tiers must have increasing ranges');
          }
        }
        return value;
      })
      .required(),
  }),

  updateServiceConfig: Joi.object({
    base_unit: Joi.number().min(1).required(),
  }),

  updateVehiclePricing: Joi.object({
    vehicle_category: Joi.string().hex().length(24).required(),
    service_config: Joi.string().hex().length(24).required(),
    tiered_pricing: Joi.array()
      .items(
        Joi.object({
          range: Joi.number().min(0).required(),
          price: Joi.number().min(0).required(),
        }),
      )
      .min(1)
      .required(),
  }),

  testPrice: Joi.object({
    base_unit: Joi.number().min(1).required(),
    tiered_pricing: Joi.array()
      .items(
        Joi.object({
          range: Joi.number().min(0).required(),
          price: Joi.number().min(0).required(),
        }),
      )
      .min(1)
      .required(),
    total_units: Joi.number().min(0).required(),
  }).unknown(true),
};
