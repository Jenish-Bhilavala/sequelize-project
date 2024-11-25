const { StatusCodes } = require("http-status-codes");
const responseData = require("../utils/message");

function HandleResponse(statusCode, status, message, data, error) {
  if (status === responseData.SUCCESS) {
    return {
      status: "success",
      statusCode: statusCode || StatusCodes.OK,
      message,
      data,
      error,
    };
  }
  return {
    status: "Error",
    statusCode: statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message,
    data,
    error,
  };
}

module.exports = HandleResponse;
