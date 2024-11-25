const db = require("../helpers/db");
const response = require("../utils/message");
const { StatusCodes } = require("http-status-codes");
const HandleResponse = require("../services/errorHandler");

module.exports = {
  getUser: async (req, res, next) => {
    try {
      const users = await db.user.findAll();

      if (users.length === 0) {
        return res.json(
          HandleResponse(
            response.RESPONSE_ERROR,
            StatusCodes.NOT_FOUND,
            response.NO_USER_FOUND,
            undefined
          )
        );
      }

      return res.json(
        HandleResponse(
          response.RESPONSE_SUCCESS,
          StatusCodes.OK,
          response.USER_RETRIEVED,
          users
        )
      );
    } catch (error) {
      next(error);
    }
  },
};
