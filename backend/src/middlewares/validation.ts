import { Joi, celebrate } from 'celebrate';

export const validateCreateProduct = celebrate({
  body: Joi.object().keys({
    title: Joi.string().min(2).max(30).required()
      .messages({
        'string.min': 'Минимальная длина поля "title" - 2 символа',
        'string.max': 'Максимальная длина поля "title" - 30 символов',
        'any.required': 'Поле "title" обязательно для заполнения',
        'string.empty': 'Поле "title" не может быть пустым',
      }),
    image: Joi.object({
      fileName: Joi.string().required()
        .messages({
          'any.required': 'Поле "fileName" обязательно',
          'string.empty': 'Поле "fileName" не может быть пустым',
        }),
      originalName: Joi.string().required()
        .messages({
          'any.required': 'Поле "originalName" обязательно',
          'string.empty': 'Поле "originalName" не может быть пустым',
        }),
    }).required()
      .messages({
        'any.required': 'Поле "image" обязательно',
        'object.base': 'Поле "image" должно быть объектом',
      }),
    category: Joi.string().required()
      .messages({
        'any.required': 'Поле "category" обязательно',
        'string.empty': 'Поле "category" не может быть пустым',
      }),
    description: Joi.string().allow('').optional(),
    price: Joi.number().min(0).allow(null).optional()
      .messages({
        'number.min': 'Цена не может быть отрицательной',
        'number.base': 'Цена должна быть числом',
      }),
  }),
});

export const validateCreateOrder = celebrate({
  body: Joi.object().keys({
    payment: Joi.string().valid('card', 'online').required()
      .messages({
        'any.only': 'Поле "payment" должно быть "card" или "online"',
        'any.required': 'Способ оплаты обязателен',
      }),
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Некорректный формат email',
        'any.required': 'Email обязателен',
      }),
    phone: Joi.string().required()
      .messages({
        'any.required': 'Телефон обязателен',
        'string.empty': 'Телефон не может быть пустым',
      }),
    address: Joi.string().required()
      .messages({
        'any.required': 'Адрес обязателен',
        'string.empty': 'Адрес не может быть пустым',
      }),
    total: Joi.number().positive().required()
      .messages({
        'number.positive': 'Сумма должна быть положительной',
        'any.required': 'Сумма заказа обязательна',
        'number.base': 'Сумма должна быть числом',
      }),
    items: Joi.array().items(
      Joi.string().hex().length(24)
        .messages({
          'string.hex': 'ID товара должен быть в hex формате',
          'string.length': 'ID товара должен содержать 24 символа',
        }),
    ).min(1).required()
      .messages({
        'array.min': 'В заказе должен быть хотя бы один товар',
        'any.required': 'Список товаров обязателен',
        'array.base': 'Поле "items" должно быть массивом',
      }),
  }),
});

export const validateProductId = celebrate({
  params: Joi.object().keys({
    id: Joi.string().hex().length(24).required()
      .messages({
        'string.hex': 'ID товара должен быть в hex формате',
        'string.length': 'ID товара должен содержать 24 символа',
        'any.required': 'ID товара обязателен',
      }),
  }),
});

export const validateUpdateProduct = celebrate({
  body: Joi.object().keys({
    title: Joi.string().min(2).max(30).optional()
      .messages({
        'string.min': 'Минимальная длина поля "title" - 2 символа',
        'string.max': 'Максимальная длина поля "title" - 30 символов',
        'string.empty': 'Поле "title" не может быть пустым',
      }),
    image: Joi.object({
      fileName: Joi.string().optional()
        .messages({
          'string.empty': 'Поле "fileName" не может быть пустым',
        }),
      originalName: Joi.string().optional()
        .messages({
          'string.empty': 'Поле "originalName" не может быть пустым',
        }),
    }).optional(),
    category: Joi.string().optional()
      .messages({
        'string.empty': 'Поле "category" не может быть пустым',
      }),
    description: Joi.string().allow('').optional(),
    price: Joi.number().min(0).allow(null).optional()
      .messages({
        'number.min': 'Цена не может быть отрицательной',
        'number.base': 'Цена должна быть числом',
      }),
  }).min(1)
    .messages({
      'object.min': 'Для обновления необходимо указать хотя бы одно поле',
    }),
});
