const express = require('express');
const router = express.Router();
const HandleResponse = require('../services/errorHandler');
const { response } = require('./enum');
const message = require('./message');
const { StatusCodes } = require('http-status-codes');

module.exports = {
  globalRoute: (req, res) => {
    return res.json(
      HandleResponse(
        response.ERROR,
        StatusCodes.METHOD_NOT_ALLOWED,
        message.METHOD_NOT_ALLOWED,
        undefined
      )
    );
  },
};
