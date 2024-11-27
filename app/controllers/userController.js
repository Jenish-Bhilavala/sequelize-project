const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../helpers/db');
const message = require('../utils/message');
const HandleResponse = require('../services/errorHandler');
const { response } = require('../utils/enum');
const { StatusCodes } = require('http-status-codes');
const { generateOTP, sendEmail } = require('../services/email');
const {
  registerValidation,
  updateUserValidation,
  loginValidation,
  forgotPasswordValidation,
} = require('../validations/userValidation');
require('dotenv').config();

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
            StatusCodes.BAD_REQUEST,
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
            `User ${message.ALREADY_EXIST}`
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
            `User ${message.NOT_FOUND}`,
            undefined
          )
        );
      }

      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.OK,
          `User ${message.RETRIEVED_SUCCESSFULLY}`,
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

      const user = await db.userModel.findByPk(id);

      if (!user) {
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.NOT_FOUND,
            `User ${message.NOT_FOUND}`,
            undefined
          )
        );
      }

      if (req.file) {
        req.body.image = path.join(req.file.filename);
      }

      const updatedUser = await user.update(req.body);

      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.OK,
          `Profile ${message.UPDATED}`,
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

  userLogin: async (req, res, next) => {
    const { email, password } = req.body;
    try {
      const { error } = loginValidation.validate(req.body);
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

      const findUser = await db.userModel.findOne({ where: { email } });
      if (!findUser) {
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.NOT_FOUND,
            `User ${message.NOT_FOUND}`,
            undefined
          )
        );
      }

      const isPasswordMatch = await bcrypt.compare(password, findUser.password);
      if (!isPasswordMatch) {
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.UNAUTHORIZED,
            message.INVALID_CREDENTIALS,
            undefined
          )
        );
      }

      const token = jwt.sign(
        { id: findUser.id, email: findUser.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '24h' }
      );

      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.OK,
          message.USER_LOGGED_IN,
          { token }
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

  verifyEmail: async (req, res, next) => {
    try {
      const email = req.body.email;
      const findUser = await db.userModel.findOne({ where: { email: email } });
      if (!findUser) {
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.NOT_FOUND,
            `User ${message.NOT_FOUND}`,
            undefined
          )
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

      return res.json(
        HandleResponse(response.SUCCESS, StatusCodes.OK, message.OTP_SENT, otp)
      );
    } catch (error) {
      return res.json(
        HandleResponse(
          response.ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.ERROR_IN_EMAIL_VERIFICATION,
          undefined,
          error.message
        )
      );
    }
  },

  forgotPassword: async (req, res, next) => {
    try {
      const { email, newPassword, otp } = req.body;

      const { error } = forgotPasswordValidation.validate(req.body);

      if (error) {
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.BAD_REQUEST,
            message.VALIDATION_ERROR,
            undefined,
            error.details[0].message
          )
        );
      }

      const findOTP = await db.otpModel.findOne({ where: { email, otp } });
      if (!findOTP || new Date() > new Date(findOTP.expireAt)) {
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.BAD_REQUEST,
            message.OTP_INVALID
          )
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const findUser = await db.userModel.findOne({ where: { email } });
      if (!findUser) {
        return res.json(
          HandleResponse(
            response.ERROR,
            StatusCodes.NOT_FOUND,
            `User ${message.NOT_FOUND}`,
            undefined
          )
        );
      }

      findUser.password = hashedPassword;
      await db.userModel.update(
        { password: hashedPassword },
        { where: { email } }
      );
      await findOTP.destroy();

      return res.json(
        HandleResponse(
          response.SUCCESS,
          StatusCodes.OK,
          `Password ${message.UPDATED}`,
          undefined
        )
      );
    } catch (error) {
      console.error(error);
      return res.json(
        HandleResponse(
          response.ERROR,
          StatusCodes.INTERNAL_SERVER_ERROR,
          message.INTERNAL_SERVER_ERROR,
          undefined
        )
      );
    }
  },
};
