const db = require('../helpers/db');
const message = require('../utils/message');
const HandleResponse = require('../services/errorHandler');
const { response } = require('../utils/enum');
const { StatusCodes } = require('http-status-codes');
const {
  portfolioValidation,
  updatePortfolioValidation,
} = require('../validations/portfolioValidation');

module.exports = {
  addPortfolio: async (req, res) => {
    try {
      const { project_name, description, category_id } = req.body;
      const { error } = portfolioValidation.validate(req.body);

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

      if (req.files.length === 0) {
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.BAD_REQUEST,
            message.IMAGE_REQUIRED,
            undefined
          )
        );
      }

      const imageArray = req.files.map((item) => item.filename);
      const image = imageArray.join(',').toString();
      const addPortfolio = await db.portfolioModel.create({
        project_name,
        category_id,
        description,
        image,
      });

      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.CREATED,
          `Project ${message.ADDED}`,
          addPortfolio,
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

  listOfPortfolio: async (req, res) => {
    try {
      const { page, limit, sortBy, orderBy, searchTerm } = req.body;
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);
      const offset = (pageNumber - 1) * limitNumber;

      const filterOperation = {};

      if (searchTerm) {
        filterOperation = {
          [db.Sequelize.Op.or]: [
            { project_name: { [db.Sequelize.Op.like]: `${searchTerm}` } },
          ],
        };
      }

      const listPortfolio = await db.portfolioModel.findAll({
        where: {
          ...filterOperation,
        },
        offset: offset,
        limit: limitNumber,
        order: [[sortBy, orderBy]],
        include: {
          model: db.categoryModel,
          attributes: ['category_name'],
        },
      });

      if (listPortfolio.length === 0) {
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.NOT_FOUND,
            `Portfolio ${message.NOT_FOUND}`,
            undefined
          )
        );
      }

      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.OK,
          undefined,
          listPortfolio,
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

  viewPortfolio: async (req, res) => {
    try {
      const { id } = req.params;
      const findPortfolio = await db.portfolioModel.findOne({
        where: { id: id },
        include: {
          model: db.categoryModel,
          attributes: ['category_name'],
        },
      });

      if (!findPortfolio) {
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.NOT_FOUND,
            `Portfolio ${message.NOT_FOUND}`,
            undefined
          )
        );
      }

      const images = findPortfolio.image ? findPortfolio.image.split(',') : [];
      findPortfolio.image = images;

      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.OK,
          undefined,
          findPortfolio,
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

  updatePortfolio: async (req, res) => {
    try {
      const { id } = req.params;
      const { error } = updatePortfolioValidation.validate(req.body);

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

      const findPortfolio = await db.portfolioModel.findOne({
        where: { id },
      });

      if (!findPortfolio) {
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.NOT_FOUND,
            `Portfolio ${message.NOT_FOUND}`,
            undefined
          )
        );
      }

      await db.portfolioModel.update(req.body, { where: { id } });

      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.OK,
          `Portfolio ${message.UPDATED}`,
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

  deletePortfolio: async (req, res) => {
    try {
      const { id } = req.params;
      const findPortfolio = await db.portfolioModel.findOne({
        where: { id },
      });

      if (!findPortfolio) {
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.NOT_FOUND,
            `Portfolio ${message.NOT_FOUND}`,
            undefined
          )
        );
      }

      await db.portfolioModel.destroy({ where: { id } });

      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.OK,
          `Portfolio ${message.DELETED}`,
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
