const Joi = require('joi');

const categoryValidation = Joi.object({
  category_name: Joi.string().required().messages({
    'string.base': `Category name must be a string.`,
    'string.empty': `Category name can not be empty.`,
    'any.required': `Category name is required field.`,
  }),
});

module.exports = {
  categoryValidation,
};
