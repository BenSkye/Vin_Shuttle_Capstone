import * as Joi from 'joi';
import { ValidationMessages } from 'src/common/constant/validation.messages';
import { VehicleCondition, VehicleOperationStatus } from 'src/share/enums/vehicle.enum';

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
            .label('Danh mục xe'),

        licensePlate: Joi.string()
            .required()
            .min(2)
            .max(20)
            .messages({
                'string.empty': ValidationMessages.string.empty,
                'any.required': ValidationMessages.string.required,
                'string.min': ValidationMessages.string.min,
                'string.max': ValidationMessages.string.max,
            })
            .label('Biển số xe'),

        image: Joi.array()
            .items(Joi.string())
            .optional()
            .messages({
                'array.base': ValidationMessages.array.base,
            })
            .label('Hình ảnh xe'),

        operationStatus: Joi.string()
            .valid(...Object.values(VehicleOperationStatus))
            .optional()
            .messages({
                'any.only': ValidationMessages.any.only,
            })
            .label('Trạng thái hoạt động'),

        vehicleCondition: Joi.string()
            .valid(...Object.values(VehicleCondition))
            .optional()
            .messages({
                'any.only': ValidationMessages.any.only,
            })
            .label('Tình trạng xe'),
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
            .label('Danh mục xe'),

        licensePlate: Joi.string()
            .min(2)
            .max(20)
            .messages({
                'string.empty': ValidationMessages.string.empty,
                'string.min': ValidationMessages.string.min,
                'string.max': ValidationMessages.string.max,
            })
            .label('Biển số xe'),

        image: Joi.array()
            .items(Joi.string())
            .messages({
                'array.base': ValidationMessages.array.base,
            })
            .label('Hình ảnh xe'),

        operationStatus: Joi.string()
            .valid(...Object.values(VehicleOperationStatus))
            .messages({
                'any.only': ValidationMessages.any.only,
            })
            .label('Trạng thái hoạt động'),

        vehicleCondition: Joi.string()
            .valid(...Object.values(VehicleCondition))
            .messages({
                'any.only': ValidationMessages.any.only,
            })
            .label('Tình trạng xe'),
    })
        .min(1)
        .messages({
            'object.min': 'Phải có ít nhất một trường cần cập nhật',
        }),
};