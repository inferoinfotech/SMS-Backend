const Joi = require("joi");

exports.createRequestSchema = Joi.object({
    requestName: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Request name is required',
            'string.min': 'Request name must be at least 2 characters long',
            'string.max': 'Request name must be at most 100 characters long'
        }),
    requesterName: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Requester name is required',
            'string.min': 'Requester name must be at least 2 characters long',
            'string.max': 'Requester name must be at most 100 characters long'
        }),
    description: Joi.string()
        .min(5)
        .max(500)
        .required()
        .messages({
            'string.empty': 'Description is required',
            'string.min': 'Description must be at least 5 characters long',
            'string.max': 'Description must be at most 500 characters long'
        }),
    date: Joi.date()
        .required()
        .messages({
            'date.base': 'A valid date is required'
        }),
    wing: Joi.string()
        .min(1)
        .max(50)
        .required()
        .messages({
            'string.empty': 'Wing is required',
            'string.min': 'Wing must be at least 2 characters long',
            'string.max': 'Wing must be at most 50 characters long'
        }),
    unit: Joi.string()
        .min(1)
        .max(50)
        .required()
        .messages({
            'string.empty': 'Unit is required',
            'string.min': 'Unit must be at least 2 characters long',
            'string.max': 'Unit must be at most 50 characters long'
        }),
    priority: Joi.string()
        .valid('Low', 'Medium', 'High')
        .required()
        .messages({
            'any.only': 'Priority must be one of Low, Medium, or High'
        }),
    status: Joi.string()
        .valid('Open', 'Pending', 'Solved')
        .default('Open'),
    isDeleted: Joi.boolean()
        .default(false)
}).options({ abortEarly: false });