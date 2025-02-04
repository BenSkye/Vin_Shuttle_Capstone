import * as Joi from 'joi';
import { ServiceType } from 'src/share/enums';

export const PricingValidation = {
    createServiceConfig: Joi.object({
        service_type: Joi.string().valid(...Object.values(ServiceType)).required(),
        base_unit: Joi.number().min(1).required(),
        base_unit_type: Joi.string().valid('minute', 'km').required()
    }),

    createVehiclePricing: Joi.object({
        vehicle_category: Joi.string().hex().length(24).required(),
        service_config: Joi.string().hex().length(24).required(),
        tiered_pricing: Joi.array().items(
            Joi.object({
                range: Joi.number().min(0).required(),
                price: Joi.number().min(0).required()
            })
        ).min(1).required()
    })
};