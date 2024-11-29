const nodemailer = require('nodemailer');
const crypto = require('crypto');
const HandleResponse = require('./errorHandler');
const { response } = require('../utils/enum');
const { StatusCodes } = require('http-status-codes');
const message = require('../utils/message');
require('dotenv').config();

const transport = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.USER_MAIL,
    pass: process.env.USER_PASS,
  },
});

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const sendEmail = async (email, otp) => {
  const mailOption = {
    to: email,
    subject: 'Email verification OTP',
    html: `
    <p>Your OTP is <strong>${otp}</strong></p>
    <p>Please do not share it with anyone.</p>
    <p>OTP will expire in 5 minutes.</p>
    `,
  };
  try {
    await transport.sendMail(mailOption);
  } catch (error) {
    throw HandleResponse(
      response.ERROR,
      StatusCodes.INTERNAL_SERVER_ERROR,
      message.OTP_ERROR,
      undefined,
      error.message
    );
  }
};

module.exports = { sendEmail, generateOTP };
