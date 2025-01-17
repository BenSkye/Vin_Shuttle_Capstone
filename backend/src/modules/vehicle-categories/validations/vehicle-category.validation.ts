import * as Joi from 'joi';
import { ValidationMessages } from 'src/common/constant/validation.messages';

export const VehicleCategoryValidation = {
    create: Joi.object({
        name: Joi.string()
            .required()
            .min(2)
            .max(100)
            .messages({
                'string.empty': ValidationMessages.string.empty,
                'any.required': ValidationMessages.string.required,
                'string.min': ValidationMessages.string.min,
                'string.max': ValidationMessages.string.max
            })
            .label('Tên danh mục'),

        description: Joi.string()
            .allow('')
            .max(500)
            .messages({
                'string.max': ValidationMessages.string.max
            })
            .label('Mô tả'),

        numberOfSeat: Joi.number()
            .required()
            .min(1)
            .max(100)
            .messages({
                'number.base': 'Số ghế phải là số',
                'any.required': 'Số ghế là bắt buộc',
                'number.min': 'Số ghế phải lớn hơn {#limit}',
                'number.max': 'Số ghế không được vượt quá {#limit}'
            })
            .label('Số ghế')
    }),

    update: Joi.object({
        name: Joi.string()
            .min(2)
            .max(100)
            .messages({
                'string.empty': ValidationMessages.string.empty,
                'string.min': ValidationMessages.string.min,
                'string.max': ValidationMessages.string.max
            })
            .label('Tên danh mục'),

        description: Joi.string()
            .allow('')
            .max(500)
            .messages({
                'string.max': ValidationMessages.string.max
            })
            .label('Mô tả'),

        numberOfSeat: Joi.number()
            .min(1)
            .max(100)
            .messages({
                'number.base': 'Số ghế phải là số',
                'number.min': 'Số ghế phải lớn hơn {#limit}',
                'number.max': 'Số ghế không được vượt quá {#limit}'
            })
            .label('Số ghế')
    })
        .min(1)
        .messages({
            'object.min': 'Phải có ít nhất một trường cần cập nhật'
        })
};