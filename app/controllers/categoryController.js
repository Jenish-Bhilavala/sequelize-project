const db = require('../helpers/db');
const message = require('../utils/message');
const HandleResponse = require('../services/errorHandler');
const { response } = require('../utils/enum');
const { StatusCodes } = require('http-status-codes');
const { categoryValidation } = require('../validations/categoryValidation');
const { when } = require('joi');

module.exports = {
  addCategory: async (req, res) => {
    try {
      const { error } = categoryValidation.validate(req.body);

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

      const addCategory = await db.categoryModel.create(req.body);

      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.CREATED,
          `Category ${message.ADDED}`,
          addCategory
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
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.NOT_FOUND,
            `Category ${message.NOT_FOUND}`,
            undefined
          )
        );
      }
      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.OK,
          undefined,
          listCategory
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

  viewCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const findCategory = await db.categoryModel.findOne({
        where: { id },
      });

      if (!findCategory) {
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.NOT_FOUND,
            `Category ${message.NOT_FOUND}`,
            undefined
          )
        );
      }

      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.OK,
          undefined,
          findCategory
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

  updateCategory: async (req, res) => {
    try {
      const { error } = categoryValidation.validate(req.body);
      const { id } = req.params;

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

      const findCategory = await db.categoryModel.findOne({
        where: { id },
      });

      if (!findCategory) {
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.NOT_FOUND,
            `Category ${message.NOT_FOUND}`,
            undefined
          )
        );
      }

      await db.categoryModel.update(req.body, { where: { id: id } });
      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.OK,
          `Category ${message.UPDATED}`,
          undefined
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

  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const findCategory = await db.categoryModel.findOne({
        where: { id },
      });

      if (!findCategory) {
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.NOT_FOUND,
            `Category ${message.NOT_FOUND}`,
            undefined
          )
        );
      }

      await findCategory.destroy();

      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.OK,
          `Category ${message.DELETED}`,
          undefined
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
