const db = require("../helpers/db");
const { GeneralError } = require("../utils/error");
const responseStatus = require("../utils/enum");
const { StatusCodes } = require("http-status-codes");
const { GeneralResponse } = require("../utils/response");

module.exports = {
  getUser: async (req, res, next) => {
    try {
      const users = await db.user.findAll();

      if (users.length === 0) {
        // return res.status(200).json({
        //   status: responseStatus.RESPONSE_SUCCESS,
        //   statusCode: StatusCodes.OK,
        //   message: "No user found.",
        //   result: [],
        // });
        return next(
          new GeneralResponse(
            responseStatus.RESPONSE_SUCCESS,
            StatusCodes.OK,
            "No users found.",
            { result: [] }
          )
        );
      }

      return next(
        new GeneralResponse(
          responseStatus.RESPONSE_SUCCESS,
          StatusCodes.OK,
          "User retrieved successfully",
          { result: users }
        )
      );
    } catch (error) {
      next(error);
    }
  },
};
