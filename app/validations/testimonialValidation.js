const Joi = require('joi');

const testimonialValidation = Joi.object({
  clint_name: Joi.string().required().messages({
    'string.base': `Name must be a string.`,
    'string.empty': `Name cannot be empty.`,
    'any.required': `Name is a required field.`,
  }),
  review: Joi.string().required().messages({
    'string.base': `Review must be a string.`,
    'string.empty': `Review cannot be empty.`,
    'any.required': `Review is a required field.`,
  }),
  image: Joi.string().optional(),
});

const updateTestimonialValidation = Joi.object({
  clint_name: Joi.string().optional().messages({
    'string.base': `Name must be a string.`,
    'string.empty': `Name cannot be empty.`,
  }),
  review: Joi.string().optional().messages({
    'string.base': `Review must be a string.`,
    'string.empty': `Review cannot be empty.`,
  }),
  image: Joi.string().optional(),
});

module.exports = {
  testimonialValidation,
  updateTestimonialValidation,
};
