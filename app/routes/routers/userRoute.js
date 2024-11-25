const express = require("express");
const router = express.Router();
const userModel = require("../../controllers/userController");

router.get("/", userModel.getUser);

module.exports = router;
