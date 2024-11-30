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
const { logger } = require('../logger/logger');

module.exports = {
  addTestimonial: async (req, res) => {
    try {
      const { clint_name, review } = req.body;
      const image = req.file ? path.join(req.file.filename) : null;
      const testimonial = { clint_name, review, image };
      const { error } = testimonialValidation.validate(req.body);

      if (error) {
        logger.error(error.details[0].message);
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.BAD_REQUEST,
            error.details[0].message,
            undefined
          )
        );
      }

      const addTestimonial = await db.testimonialModel.create(testimonial);

      logger.info(`Review ${message.ADDED}`);
      return res.json(
        HandleResponse(response.SUCCESS, StatusCodes.CREATED, undefined, {
          id: addTestimonial.id,
        })
      );
    } catch (error) {
      logger.error(error, message || error);
      return res.json(
        HandleResponse(
          response.ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          error.message || error,
          undefined
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
        logger.error(`Testimonial ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(response.ERROR, StatusCodes.NOT_FOUND, undefined)
        );
      }

      logger.info(`Testimonial ${message.RETRIEVED_SUCCESSFULLY}`);
      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.OK,
          undefined,
          findTestimonial
        )
      );
    } catch (error) {
      logger.error(error, message || error);
      return res.json(
        HandleResponse(
          response.ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          error.message || error,
          undefined
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
        logger.error(`Testimonial ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(response.ERROR, StatusCodes.NOT_FOUND, undefined)
        );
      }

      logger.info(`Testimonial ${message.RETRIEVED_SUCCESSFULLY}`);
      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.OK,
          undefined,
          findTestimonial
        )
      );
    } catch (error) {
      logger.error(error, message || error);
      return res.json(
        HandleResponse(
          response.ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          error.message || error,
          undefined
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
        logger.error(error.details[0].message);
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.BAD_REQUEST,
            error.details[0].message,
            undefined
          )
        );
      }

      const findTestimonial = await db.testimonialModel.findOne({
        where: { id },
      });

      logger.error(`Testimonial ${message.NOT_FOUND}`);
      if (!findTestimonial) {
        return res.json(
          HandleResponse(response.ERROR, StatusCodes.NOT_FOUND, undefined)
        );
      }

      const image = req.file
        ? path.join(req.file.filename)
        : findTestimonial.image;
      const testimonial = { clint_name, review, image };

      await db.testimonialModel.update(testimonial, {
        where: { id },
      });

      logger.info(`Testimonial ${message.UPDATED}`);
      return res.json(
        HandleResponse(response.SUCCESS, StatusCodes.ACCEPTED, undefined)
      );
    } catch (error) {
      logger.error(error, message || error);
      return res.json(
        HandleResponse(
          response.ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          error.message || error,
          undefined
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
        logger.error(`Testimonial ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(response.ERROR, StatusCodes.NOT_FOUND, undefined)
        );
      }

      await db.testimonialModel.destroy({ where: { id } });

      logger.info(`Testimonial ${message.DELETED}`);
      return res.json(
        HandleResponse(response.SUCCESS, StatusCodes.OK, undefined)
      );
    } catch (error) {
      logger.error(error, message || error);
      return res.json(
        HandleResponse(
          response.ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          error.message || error,
          undefined
        )
      );
    }
  },
};
