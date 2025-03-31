import * as Joi from 'joi';
import { ValidationMessages } from 'src/common/constant/validation.messages';
import { PaymentMethod } from 'src/share/enums/payment.enum';

// Validation for StartOrEndPoint object
const pointSchema = Joi.object({
  position: Joi.object({
    lat: Joi.number()
      .required()
      .messages({
        'number.base': ValidationMessages.number.base,
        'any.required': ValidationMessages.any.required,
      })
      .label('Vĩ độ'),

    lng: Joi.number()
      .required()
      .messages({
        'number.base': ValidationMessages.number.base,
        'any.required': ValidationMessages.any.required,
      })
      .label('Kinh độ'),
  })
    .required()
    .messages({
      'any.required': ValidationMessages.any.required,
    })
    .label('Vị trí'),

  address: Joi.string()
    .required()
    .messages({
      'string.empty': ValidationMessages.string.empty,
      'any.required': ValidationMessages.string.required,
    })
    .label('Địa chỉ'),
}).required();

// Validation for vehicle categories array item
const vehicleCategoryItemSchema = Joi.object({
  categoryVehicleId: Joi.string()
    .required()
    .messages({
      'string.empty': ValidationMessages.string.empty,
      'any.required': ValidationMessages.string.required,
    })
    .label('ID danh mục xe'),

  name: Joi.string()
    .required()
    .messages({
      'string.empty': ValidationMessages.string.empty,
      'any.required': ValidationMessages.string.required,
    })
    .label('Tên danh mục xe'),

  quantity: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': ValidationMessages.number.base,
      'number.integer': ValidationMessages.number.integer,
      'number.positive': ValidationMessages.number.positive,
      'number.min': ValidationMessages.number.min,
      'any.required': ValidationMessages.any.required,
    })
    .label('Số lượng'),
});

// Validation for vehicle categories in destination booking
const vehicleCategoryDestinationSchema = Joi.object({
  categoryVehicleId: Joi.string()
    .required()
    .messages({
      'string.empty': ValidationMessages.string.empty,
      'any.required': ValidationMessages.string.required,
    })
    .label('ID danh mục xe'),

  name: Joi.string()
    .required()
    .messages({
      'string.empty': ValidationMessages.string.empty,
      'any.required': ValidationMessages.string.required,
    })
    .label('Tên danh mục xe'),
});

export const BookingValidation = {
  // Booking Hour validation
  bookingHour: Joi.object({
    startPoint: pointSchema.label('Điểm đón'),

    date: Joi.string()
      .required()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .messages({
        'string.empty': ValidationMessages.string.empty,
        'any.required': ValidationMessages.string.required,
        'string.pattern.base': 'Ngày phải có định dạng YYYY-MM-DD',
      })
      .label('Ngày'),

    startTime: Joi.string()
      .required()
      .regex(/^\d{2}:\d{2}$/)
      .messages({
        'string.empty': ValidationMessages.string.empty,
        'any.required': ValidationMessages.string.required,
        'string.pattern.base': 'Thời gian phải có định dạng HH:MM',
      })
      .label('Thời gian bắt đầu'),

    durationMinutes: Joi.number()
      .integer()
      .min(15)
      .required()
      .messages({
        'number.base': ValidationMessages.number.base,
        'number.integer': ValidationMessages.number.integer,
        'number.min': 'Thời gian phải ít nhất {#limit} phút',
        'any.required': ValidationMessages.any.required,
      })
      .label('Thời gian thuê (phút)'),

    vehicleCategories: Joi.array()
      .items(vehicleCategoryItemSchema)
      .min(1)
      .required()
      .messages({
        'array.base': ValidationMessages.array.base,
        'array.min': ValidationMessages.array.min,
        'any.required': ValidationMessages.any.required,
      })
      .label('Danh mục xe và số lượng'),

    paymentMethod: Joi.string()
      .valid(...Object.values(PaymentMethod))
      .required()
      .messages({
        'string.empty': ValidationMessages.string.empty,
        'any.required': ValidationMessages.string.required,
        'any.only': ValidationMessages.any.only,
      })
      .label('Phương thức thanh toán'),
  }),

  // Booking Scenic Route validation
  bookingScenicRoute: Joi.object({
    startPoint: pointSchema.label('Điểm đón'),

    scenicRouteId: Joi.string()
      .required()
      .messages({
        'string.empty': ValidationMessages.string.empty,
        'any.required': ValidationMessages.string.required,
      })
      .label('ID lộ trình tham quan'),

    date: Joi.string()
      .required()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .messages({
        'string.empty': ValidationMessages.string.empty,
        'any.required': ValidationMessages.string.required,
        'string.pattern.base': 'Ngày phải có định dạng YYYY-MM-DD',
      })
      .label('Ngày'),

    startTime: Joi.string()
      .required()
      .regex(/^\d{2}:\d{2}$/)
      .messages({
        'string.empty': ValidationMessages.string.empty,
        'any.required': ValidationMessages.string.required,
        'string.pattern.base': 'Thời gian phải có định dạng HH:MM',
      })
      .label('Thời gian bắt đầu'),

    vehicleCategories: Joi.array()
      .items(vehicleCategoryItemSchema)
      .min(1)
      .required()
      .messages({
        'array.base': ValidationMessages.array.base,
        'array.min': ValidationMessages.array.min,
        'any.required': ValidationMessages.any.required,
      })
      .label('Danh mục xe và số lượng'),

    paymentMethod: Joi.string()
      .valid(...Object.values(PaymentMethod))
      .required()
      .messages({
        'string.empty': ValidationMessages.string.empty,
        'any.required': ValidationMessages.string.required,
        'any.only': ValidationMessages.any.only,
      })
      .label('Phương thức thanh toán'),
  }),

  // Booking Destination validation
  bookingDestination: Joi.object({
    startPoint: pointSchema.label('Điểm đón'),

    endPoint: pointSchema.label('Điểm đến'),

    durationEstimate: Joi.number()
      .min(1)
      .required()
      .messages({
        'number.base': ValidationMessages.number.base,
        'number.min': ValidationMessages.number.min,
        'any.required': ValidationMessages.any.required,
      })
      .label('Thời gian ước tính (phút)'),

    distanceEstimate: Joi.number()
      .min(0.1)
      .required()
      .messages({
        'number.base': ValidationMessages.number.base,
        'number.min': ValidationMessages.number.min,
        'any.required': ValidationMessages.any.required,
      })
      .label('Khoảng cách ước tính (km)'),

    vehicleCategories: vehicleCategoryDestinationSchema
      .required()
      .messages({
        'any.required': ValidationMessages.any.required,
      })
      .label('Danh mục xe'),

    paymentMethod: Joi.string()
      .valid(...Object.values(PaymentMethod))
      .required()
      .messages({
        'string.empty': ValidationMessages.string.empty,
        'any.required': ValidationMessages.string.required,
        'any.only': ValidationMessages.any.only,
      })
      .label('Phương thức thanh toán'),
  }),

  // Booking Shared Itinerary validation
  bookingSharedItinerary: Joi.object({
    startPoint: pointSchema.label('Điểm đón'),

    endPoint: pointSchema.label('Điểm đến'),

    durationEstimate: Joi.number()
      .min(1)
      .required()
      .messages({
        'number.base': ValidationMessages.number.base,
        'number.min': ValidationMessages.number.min,
        'any.required': ValidationMessages.any.required,
      })
      .label('Thời gian ước tính (phút)'),

    distanceEstimate: Joi.number()
      .min(0.1)
      .required()
      .messages({
        'number.base': ValidationMessages.number.base,
        'number.min': ValidationMessages.number.min,
        'any.required': ValidationMessages.any.required,
      })
      .label('Khoảng cách ước tính (km)'),

    numberOfSeat: Joi.number()
      .integer()
      .min(1)
      .required()
      .messages({
        'number.base': ValidationMessages.number.base,
        'number.integer': ValidationMessages.number.integer,
        'number.min': ValidationMessages.number.min,
        'any.required': ValidationMessages.any.required,
      })
      .label('Số ghế'),

    paymentMethod: Joi.string()
      .valid(...Object.values(PaymentMethod))
      .required()
      .messages({
        'string.empty': ValidationMessages.string.empty,
        'any.required': ValidationMessages.string.required,
        'any.only': ValidationMessages.any.only,
      })
      .label('Phương thức thanh toán'),
  }),
};
