const path = require('path');
const db = require('../helpers/db');
const message = require('../utils/message');
const HandleResponse = require('../services/errorHandler');
const { response } = require('../utils/enum');
const { StatusCodes } = require('http-status-codes');
const {
  testimonialValidation,
  updateTestimonialValidation,
} = require('../validations/testimonialValidation');

module.exports = {
  addTestimonial: async (req, res) => {
    try {
      const { clint_name, review } = req.body;
      const image = req.file ? path.join(req.file.filename) : null;
      const testimonial = { clint_name, review, image };
      const { error } = testimonialValidation.validate(req.body);

      if (error) {
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.BAD_REQUEST,
            message.VALIDATION_ERROR,
            undefined,
            error.details[0].message
          )
        );
      }

      const addTestimonial = await db.testimonialModel.create(testimonial);

      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.CREATED,
          `Review ${message.ADDED}`,
          addTestimonial
        )
      );
    } catch (error) {
      return res.json(
        HandleResponse(
          response.ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.INTERNAL_SERVER_ERROR,
          undefined,
          error.message || error
        )
      );
    }
  },

  listOfTestimonial: async (req, res) => {
    try {
      const { page, limit, sortBy, orderBy, searchTerm } = req.body;
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);
      const offset = (pageNumber - 1) * limitNumber;

      const filterOperation = {};

      if (searchTerm) {
        filterOperation = {
          [db.Sequelize.Op.or]: [
            { clint_name: { [db.Sequelize.Op.like]: `${searchTerm}` } },
          ],
        };
      }

      const findTestimonial = await db.testimonialModel.findAll({
        where: {
          ...filterOperation,
        },
        offset: offset,
        limit: limitNumber,
        order: [[sortBy, orderBy]],
      });

      if (findTestimonial.length === 0) {
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.NOT_FOUND,
            `Testimonials ${message.NOT_FOUND}`,
            undefined
          )
        );
      }

      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.OK,
          undefined,
          findTestimonial
        )
      );
    } catch (error) {
      return res.json(
        HandleResponse(
          response.ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.INTERNAL_SERVER_ERROR,
          undefined,
          error.message || error
        )
      );
    }
  },

  viewTestimonial: async (req, res) => {
    try {
      const { id } = req.params;
      const findTestimonial = await db.testimonialModel.findOne({
        where: { id },
      });

      if (!findTestimonial) {
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.NOT_FOUND,
            `Testimonial ${message.NOT_FOUND}`
          )
        );
      }

      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.OK,
          undefined,
          findTestimonial
        )
      );
    } catch (error) {
      return res.json(
        HandleResponse(
          response.ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.INTERNAL_SERVER_ERROR,
          error.message || error
        )
      );
    }
  },

  updateTestimonial: async (req, res) => {
    try {
      const { id } = req.params;
      const { clint_name, review } = req.body;
      const { error } = updateTestimonialValidation.validate(req.body);

      if (error) {
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.BAD_REQUEST,
            message.VALIDATION_ERROR,
            error.details[0].message
          )
        );
      }

      const findTestimonial = await db.testimonialModel.findOne({
        where: { id },
      });

      if (!findTestimonial) {
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.NOT_FOUND,
            `Testimonial ${message.NOT_FOUND}`
          )
        );
      }

      const image = req.file
        ? path.join(req.file.filename)
        : findTestimonial.image;
      const testimonial = { clint_name, review, image };

      await db.testimonialModel.update(testimonial, {
        where: { id },
      });

      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.OK,
          `Testimonial ${message.UPDATED}`
        )
      );
    } catch (error) {
      return res.json(
        HandleResponse(
          response.ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.INTERNAL_SERVER_ERROR,
          undefined,
          error.message || error
        )
      );
    }
  },

  deleteTestimonial: async (req, res) => {
    try {
      const { id } = req.params;
      const findTestimonial = await db.testimonialModel.findOne({
        where: { id },
      });

      if (!findTestimonial) {
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.NOT_FOUND,
            `Testimonial ${message.NOT_FOUND}`,
            undefined
          )
        );
      }

      await db.testimonialModel.destroy({ where: { id } });

      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.OK,
          `Testimonial ${message.DELETED}`
        )
      );
    } catch (error) {
      return res.json(
        HandleResponse(
          response.ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.INTERNAL_SERVER_ERROR,
          undefined,
          error.message || error
        )
      );
    }
  },
};
