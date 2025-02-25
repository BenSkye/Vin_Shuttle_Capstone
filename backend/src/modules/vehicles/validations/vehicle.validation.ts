import * as Joi from 'joi';
import { ValidationMessages } from 'src/common/constant/validation.messages';
import { vehicleStatus } from 'src/modules/vehicles/vehicles.port';

export const VehicleValidation = {
  create: Joi.object({
    name: Joi.string()
      .required()
      .min(2)
      .max(100)
      .messages({
        'string.empty': ValidationMessages.string.empty,
        'any.required': ValidationMessages.string.required,
        'string.min': ValidationMessages.string.min,
        'string.max': ValidationMessages.string.max,
      })
      .label('Tên xe'),

    categoryId: Joi.string()
      .required()
      .messages({
        'string.empty': ValidationMessages.string.empty,
        'any.required': ValidationMessages.string.required,
      })
      .label('ID danh mục'),

    licensePlate: Joi.string()
      .required()
      .messages({
        'string.empty': ValidationMessages.string.empty,
        'any.required': ValidationMessages.string.required,
      })
      .label('Biển số xe'),

    image: Joi.array().label('Hình ảnh xe'),

    isActive: Joi.boolean()
      .default(true)
      .messages({
        'boolean.base': ValidationMessages.boolean.base,
      })
      .label('Trạng thái hoạt động'),

    status: Joi.string()
      .valid(...vehicleStatus)
      .default('available')
      .messages({
        'any.only': ValidationMessages.any.only,
      })
      .label('Trạng thái'),
  }),

  update: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .messages({
        'string.empty': ValidationMessages.string.empty,
        'string.min': ValidationMessages.string.min,
        'string.max': ValidationMessages.string.max,
      })
      .label('Tên xe'),

    categoryId: Joi.string()
      .messages({
        'string.empty': ValidationMessages.string.empty,
      })
      .label('ID danh mục'),

    licensePlate: Joi.string()
      .messages({
        'string.empty': ValidationMessages.string.empty,
      })
      .label('Biển số xe'),
    image: Joi.array().label('Hình ảnh xe'),
    isActive: Joi.boolean()
      .messages({
        'boolean.base': ValidationMessages.boolean.base,
      })
      .label('Trạng thái hoạt động'),

    status: Joi.string()
      .valid(...vehicleStatus)
      .messages({
        'any.only': ValidationMessages.any.only,
      })
      .label('Trạng thái'),
  })
    .min(1)
    .messages({
      'object.min': 'Phải có ít nhất một trường cần cập nhật',
    }),
};
