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

      const { firstName, lastName, hobby, gender, phone } = req.body;
      const user = await db.userModel.findByPk(id);

      if (!user) {
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.NOT_FOUND,
            message.NO_USER_FOUND,
            undefined
          )
        );
      }

      const image = req.file ? path.join(req.file.filename) : user.image;
      const updatedData = {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(hobby && { hobby }),
        ...(gender && { gender }),
        ...(phone && { phone }),
        ...(req.file && { image }),
      };

      const updatedUser = await user.update(updatedData);

      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.OK,
          message.PROFILE_UPDATED,
          updatedUser
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
