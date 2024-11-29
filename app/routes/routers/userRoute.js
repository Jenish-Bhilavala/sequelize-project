const express = require('express');
const router = express.Router();
const upload = require('../../utils/multer');
const userModel = require('../../controllers/userController');

router.post('/', upload.single('image'), userModel.registerUser);
router.get('/view-profile/:id', userModel.viewProfile);
router.put(
  '/update-profile/:id',
  upload.single('image'),
  userModel.updateProfile
);
router.post('/login', userModel.userLogin);
router.post('/verify-email', userModel.verifyEmail);
router.put('/forgot-password', userModel.forgotPassword);

module.exports = router;
