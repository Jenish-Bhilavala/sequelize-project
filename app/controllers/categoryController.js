const db = require('../helpers/db');
const message = require('../utils/message');
const HandleResponse = require('../services/errorHandler');
const { response } = require('../utils/enum');
const { StatusCodes } = require('http-status-codes');
const { categoryValidation } = require('../validations/categoryValidation');
const { logger } = require('../logger/logger');

module.exports = {
  addCategory: async (req, res) => {
    try {
      const { error } = categoryValidation.validate(req.body);

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

      const addCategory = await db.categoryModel.create(req.body);

      logger.info(`Category ${message.ADDED}`);
      return res.json(
        HandleResponse(response.SUCCESS, StatusCodes.CREATED, undefined, {
          id: addCategory.id,
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

  listOfCategory: async (req, res) => {
    try {
      const { page, limit, sortBy, orderBy, searchTerm } = req.body;
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);
      const offset = (pageNumber - 1) * limitNumber;

      const filterOperation = {};

      if (searchTerm) {
        filterOperation = {
          [db.Sequelize.Op.or]: [
            { category: { [db.Sequelize.Op.like]: `${searchTerm}` } },
          ],
        };
      }

      const listCategory = await db.categoryModel.findAll({
        where: { ...filterOperation },
        offset: offset,
        limit: limitNumber,
        order: [[sortBy, orderBy]],
      });

      if (listCategory.length === 0) {
        logger.error(`Category ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(response.ERROR, StatusCodes.NOT_FOUND, undefined)
        );
      }

      logger.info(`Category ${message.RETRIEVED_SUCCESSFULLY}`);
      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.OK,
          undefined,
          listCategory
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

  viewCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const findCategory = await db.categoryModel.findOne({
        where: { id },
      });

      if (!findCategory) {
        logger.error(`Category ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(response.ERROR, StatusCodes.NOT_FOUND, undefined)
        );
      }

      logger.info(`Category ${message.RETRIEVED_SUCCESSFULLY}`);
      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.OK,
          undefined,
          findCategory
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

  updateCategory: async (req, res) => {
    try {
      const { error } = categoryValidation.validate(req.body);
      const { id } = req.params;

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

      const findCategory = await db.categoryModel.findOne({
        where: { id },
      });

      if (!findCategory) {
        logger.error(`Category ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(response.ERROR, StatusCodes.NOT_FOUND, undefined)
        );
      }

      await db.categoryModel.update(req.body, { where: { id } });
      logger.info(`Category ${message.UPDATED}`);
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

  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const findCategory = await db.categoryModel.findOne({
        where: { id },
      });

      if (!findCategory) {
        logger.error(`Category ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(response.ERROR, StatusCodes.NOT_FOUND, undefined)
        );
      }

      await findCategory.destroy();

      logger.info(`Category ${message.DELETED}`);
      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.OK,
          `Category ${message.DELETED}`,
          undefined
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
};
