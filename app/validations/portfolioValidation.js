const Joi = require('joi');

const portfolioValidation = Joi.object({
  project_name: Joi.string().required().messages({
    'string.base': `Project name must be a string.`,
    'string.empty': `Project name cannot be empty.`,
    'any.required': `Project name is a required field.`,
  }),
  category_id: Joi.number().required().messages({
    'number.base': `Category id must be a number.`,
    'number.empty': `Category id cannot be null.`,
    'any.required': `Category id is a required field.`,
  }),
  description: Joi.string().required().messages({
    'string.base': `Description must be a string.`,
    'string.empty': `Description cannot be empty.`,
    'any.required': `Description is a required field.`,
  }),
  image: Joi.string().optional(),
});

const updatePortfolioValidation = Joi.object({
  project_name: Joi.string().optional().messages({
    'string.base': `Project name must be a string.`,
    'string.empty': `Project name cannot be empty.`,
  }),
  category_id: Joi.number().optional().messages({
    'number.base': `Category id must be a number.`,
    'number.empty': `Category id cannot be null.`,
  }),
  description: Joi.string().optional().messages({
    'string.base': `Description must be a string.`,
    'string.empty': `Description cannot be empty.`,
  }),
  image: Joi.string().optional(),
});

module.exports = {
  portfolioValidation,
  updatePortfolioValidation,
};
