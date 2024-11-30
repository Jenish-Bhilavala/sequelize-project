const express = require('express');
const router = express.Router();
const upload = require('../../utils/multer');
const userModel = require('../../controllers/userController');
const { globalRoute } = require('../../utils/globalRoute');

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
router.all('*', globalRoute);

module.exports = router;
