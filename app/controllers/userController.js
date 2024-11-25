const db = require("../helpers/db");
const responseStatus = require("../utils/enum");
const { StatusCodes } = require("http-status-codes");
const HandleResponse = require("../services/errorHandler");

module.exports = {
  getUser: async (req, res, next) => {
    try {
      const users = await db.user.findAll();

      if (users.length === 0) {
        return res.json(
          HandleResponse(
            StatusCodes.NOT_FOUND,
            responseStatus.RESPONSE_ERROR,
            "No user found.",
            undefined
          )
        );
      }

      return res.json(
        HandleResponse(
          StatusCodes.OK,
          responseStatus.RESPONSE_SUCCESS,
          "User retrieved successfully",
          users
        )
      );
    } catch (error) {
      next(error);
    }
  },
};
