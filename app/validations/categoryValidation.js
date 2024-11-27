const Joi = require('joi');

const categoryValidation = Joi.object({
  category: Joi.string().required().messages({
    'string.base': `Category must be a string.`,
    'string.empty': `Category can not be empty.`,
    'any.required': `Category is required field.`,
  }),
});

module.exports = {
  categoryValidation,
};
