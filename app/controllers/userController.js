const db = require('../helpers/db');
const { response } = require('../utils/enum');
const message = require('../utils/message');
const { StatusCodes } = require('http-status-codes');
const HandleResponse = require('../services/errorHandler');

module.exports = {
  getUser: async (req, res, next) => {
    try {
      const findUser = await db.userModel.findAll();

      if (findUser.length === 0) {
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            message.NO_USER_FOUND,
            undefined
          )
        );
      }

      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.OK,
          message.USER_RETRIEVED,
          findUser
        )
      );
    } catch (error) {
      next(
        res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.INTERNAL_SERVER_ERROR,
            message.INTERNAL_SERVER_ERROR,
            undefined,
            error
          )
        )
      );
    }
  },
};
