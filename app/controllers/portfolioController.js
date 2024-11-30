const db = require('../helpers/db');
const message = require('../utils/message');
const HandleResponse = require('../services/errorHandler');
const { response } = require('../utils/enum');
const { StatusCodes } = require('http-status-codes');
const {
  portfolioValidation,
  updatePortfolioValidation,
} = require('../validations/portfolioValidation');
const { logger } = require('../logger/logger');

module.exports = {
  addPortfolio: async (req, res) => {
    try {
      const { project_name, description, category_id } = req.body;
      const { error } = portfolioValidation.validate(req.body);

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

      if (req.files.length === 0) {
        logger.error(message.IMAGE_REQUIRED);
        return res.json(
          HandleResponse(response.ERROR, StatusCodes.BAD_REQUEST, undefined)
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

      logger.info(`Project ${message.ADDED}`);
      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.CREATED,
          undefined,
          { id: addPortfolio.id },
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
        include: [
          {
            model: db.categoryModel,
            attributes: ['category_name'],
          },
        ],
      });

      if (listPortfolio.length === 0) {
        logger.error(`Portfolio ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(response.ERROR, StatusCodes.NOT_FOUND, undefined)
        );
      }

      logger.info(`Portfolio ${message.RETRIEVED_SUCCESSFULLY}`);
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
        logger.error(`Portfolio ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(response.ERROR, StatusCodes.NOT_FOUND, undefined)
        );
      }

      const images = findPortfolio.image ? findPortfolio.image.split(',') : [];
      findPortfolio.image = images;

      logger.info(`Portfolio ${message.RETRIEVED_SUCCESSFULLY}`);
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

  updatePortfolio: async (req, res) => {
    try {
      const { id } = req.params;
      const { project_name, category_id, description } = req.body;
      const { error } = updatePortfolioValidation.validate(req.body);

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

      const findPortfolio = await db.portfolioModel.findOne({
        where: { id },
      });

      if (!findPortfolio) {
        logger.error(`Portfolio ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(response.ERROR, StatusCodes.NOT_FOUND, undefined)
        );
      }

      const imageArray = req.files.map((item) => item.filename);
      const image = imageArray.join(',').toString();
      const portfolio = { project_name, category_id, description, image };

      await db.portfolioModel.update(portfolio, { where: { id } });

      logger.info(`Portfolio ${message.UPDATED}`);
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

  deletePortfolio: async (req, res) => {
    try {
      const { id } = req.params;
      const findPortfolio = await db.portfolioModel.findOne({
        where: { id },
      });

      if (!findPortfolio) {
        logger.error(`Portfolio ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(response.ERROR, StatusCodes.NOT_FOUND, undefined)
        );
      }

      await db.portfolioModel.destroy({ where: { id } });

      logger.info(`Portfolio ${message.DELETED}`);
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
