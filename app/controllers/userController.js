const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../helpers/db');
const message = require('../utils/message');
const { logger } = require('../logger/logger');
const HandleResponse = require('../services/errorHandler');
const { response } = require('../utils/enum');
const { StatusCodes } = require('http-status-codes');
const { generateOTP, sendEmail } = require('../services/email');
const {
  registerValidation,
  updateUserValidation,
  loginValidation,
  verifyEmailValidation,
  forgotPasswordValidation,
} = require('../validations/userValidation');
require('dotenv').config();

module.exports = {
  registerUser: async (req, res) => {
    try {
      const { firstName, lastName, hobby, gender, email, password, phone } =
        req.body;

      const { error } = registerValidation.validate(req.body);
      if (error) {
        logger.error(error.details[0].message);
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.BAD_REQUEST,
            message.details[0].message,
            undefined
          )
        );
      }

      const existingUser = await db.userModel.findOne({ where: { email } });

      if (existingUser) {
        logger.error(`User ${message.ALREADY_EXIST}`);
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.BAD_REQUEST,
            message.BAD_REQUEST,
            undefined
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

      logger.info(`${message.USER_REGISTERED}`);
      res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.CREATED,
          undefined,
          { id: newUser.id },
          undefined
        )
      );
    } catch (error) {
      logger.error(error.message || error);
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

  viewProfile: async (req, res) => {
    const id = req.params.id;

    try {
      const findUser = await db.userModel.findByPk(id, {
        attributes: { exclude: ['password'] },
      });

      if (!findUser) {
        logger.error(`User ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(response.ERROR, StatusCodes.NOT_FOUND, undefined)
        );
      }

      logger.info(`User ${message.RETRIEVED_SUCCESSFULLY}`);
      return res.json(
        HandleResponse(response.SUCCESS, StatusCodes.OK, undefined, findUser)
      );
    } catch (error) {
      logger.error(error.message || error);
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

  updateProfile: async (req, res) => {
    try {
      const id = req.params.id;
      const { error } = updateUserValidation.validate(req.body);

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

      const findUser = await db.userModel.findByPk(id);

      if (!findUser) {
        logger.error(`User ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(response.ERROR, StatusCodes.NOT_FOUND, undefined)
        );
      }

      if (req.file) {
        req.body.image = path.join(req.file.filename);
      }

      await db.userModel.update(req.body, {
        where: { id: findUser.id },
      });

      logger.info(`Profile ${message.UPDATED}`);
      return res.json(
        HandleResponse(response.SUCCESS, StatusCodes.ACCEPTED, undefined)
      );
    } catch (error) {
      logger.error(error.message || error);
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

  userLogin: async (req, res) => {
    try {
      const { email, password } = req.body;
      const { error } = loginValidation.validate(req.body);

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

      const findUser = await db.userModel.findOne({ where: { email } });

      if (!findUser) {
        logger.error(`User ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(response.ERROR, StatusCodes.NOT_FOUND, undefined)
        );
      }

      const isPasswordMatch = await bcrypt.compare(password, findUser.password);

      if (!isPasswordMatch) {
        logger.error(message.INVALID_CREDENTIALS_PASS);
        return res.json(
          HandleResponse(response.ERROR, StatusCodes.UNAUTHORIZED, undefined)
        );
      }

      const token = jwt.sign(
        { id: findUser.id, email: findUser.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: process.env.JWT_EXPIRE_IN }
      );

      logger.info(message.USER_LOGGED_IN);
      return res.json(
        HandleResponse(response.SUCCESS, StatusCodes.OK, undefined, { token })
      );
    } catch (error) {
      logger.error(error.message || error);
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

  verifyEmail: async (req, res) => {
    try {
      const email = req.body.email;
      const { error } = verifyEmailValidation.validate(req.body);

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

      const findUser = await db.userModel.findOne({ where: { email } });
      if (!findUser) {
        logger.error(`User ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(response.ERROR, StatusCodes.NOT_FOUND, undefined)
        );
      }

      const otp = generateOTP();
      const expireAt = new Date();
      expireAt.setMinutes(expireAt.getMinutes() + 5);

      await db.otpModel.create({
        email,
        otp,
        expireAt,
      });

      await sendEmail(email, otp);

      logger.info(message.OTP_SENT);
      return res.json(
        HandleResponse(response.SUCCESS, StatusCodes.OK, undefined, {
          otp,
        })
      );
    } catch (error) {
      logger.error(error.message || error);
      return res.json(
        HandleResponse(
          response.ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.ERROR_IN_EMAIL_VERIFICATION,
          undefined,
          error.message || error
        )
      );
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email, newPassword, otp } = req.body;
      const { error } = forgotPasswordValidation.validate(req.body);

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

      const findOTP = await db.otpModel.findOne({ where: { email, otp } });

      if (!findOTP) {
        logger.error(message.OTP_INVALID);
        return res.json(
          HandleResponse(response.ERROR, StatusCodes.BAD_REQUEST, undefined)
        );
      }

      if (new Date() > new Date(findOTP.expireAt)) {
        await findOTP.destroy();
        logger.error(message.OTP_EXPIRED);
        return res.json(
          HandleResponse(response.ERROR, StatusCodes.BAD_REQUEST, undefined)
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const findUser = await db.userModel.findOne({ where: { email } });

      if (!findUser) {
        logger.error(`User ${message.NOT_FOUND}`);
        return res.json(
          HandleResponse(response.ERROR, StatusCodes.NOT_FOUND, undefined)
        );
      }

      findUser.password = hashedPassword;
      await db.userModel.update(
        { password: hashedPassword },
        { where: { email } }
      );
      await findOTP.destroy();

      logger.info(`Your password ${message.UPDATED}`);
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
};
