const path = require('path');
const bcrypt = require('bcrypt');
const db = require('../helpers/db');
const message = require('../utils/message');
const HandleResponse = require('../services/errorHandler');
const { response } = require('../utils/enum');
const { StatusCodes } = require('http-status-codes');
const {
  registerValidation,
  updateUserValidation,
} = require('../validations/userValidation');
const { log } = require('console');

module.exports = {
  registerUser: async (req, res, next) => {
    try {
      const { firstName, lastName, hobby, gender, email, password, phone } =
        req.body;

      const { error } = registerValidation.validate(req.body);
      if (error) {
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.INTERNAL_SERVER_ERROR,
            message.VALIDATION_ERROR,
            undefined,
            `${error.details[0].message}`
          )
        );
      }

      const existingUser = await db.userModel.findOne({ where: { email } });

      if (existingUser) {
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.BAD_REQUEST,
            message.BAD_REQUEST,
            undefined,
            message.USER_EXIST
          )
        );
      }

      const image = req.file ? path.join(req.file.filename) : null;
      const saltRound = 10;
      const hashedPassword = await bcrypt.hash(password, saltRound);

      const newUser = await db.userModel.create({
        firstName,
        lastName,
        hobby,
        gender,
        email,
        password: hashedPassword,
        phone,
        image,
      });

      res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.CREATED,
          message.USER_REGISTERED,
          newUser,
          undefined
        )
      );
    } catch (error) {
      next(
        res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.INTERNAL_SERVER_ERROR,
            message.INTERNAL_SERVER_ERROR,
            undefined,
            error.message || error
          )
        )
      );
    }
  },

  viewProfile: async (req, res, next) => {
    const id = req.params.id;

    try {
      const findUser = await db.userModel.findByPk(id, {
        attributes: { exclude: ['password'] },
      });

      if (!findUser) {
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.NOT_FOUND,
            message.NO_USER_FOUND,
            undefined
          )
        );
      }

      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.OK,
          message.USER_RETRIEVED,
          findUser
        )
      );
    } catch (error) {
      next(
        res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.INTERNAL_SERVER_ERROR,
            message.INTERNAL_SERVER_ERROR,
            undefined,
            error.message || error
          )
        )
      );
    }
  },

  updateProfile: async (req, res, next) => {
    const id = req.params.id;

    try {
      const { error } = updateUserValidation.validate(req.body);
      if (error) {
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.INTERNAL_SERVER_ERROR,
            message.VALIDATION_ERROR,
            undefined,
            `${error.details[0].message}`
          )
        );
      }

      const findUser = await db.userModel.findByPk(id);

      if (!findUser) {
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.NOT_FOUND,
            message.NO_USER_FOUND,
            undefined
          )
        );
      }

      if (req.file) {
        req.body.image = path.join(req.file.filename);
      }

      const updatedUser = await db.userModel.update(req.body, {
        where: { id: findUser.id },
      });

      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.OK,
          message.PROFILE_UPDATED,
          undefined
        )
      );
    } catch (error) {
      console.error(error);
      next(
        res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.INTERNAL_SERVER_ERROR,
            message.INTERNAL_SERVER_ERROR,
            undefined,
            error.message || error
          )
        )
      );
    }
  },
};
