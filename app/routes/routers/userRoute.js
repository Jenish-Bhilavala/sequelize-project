const express = require('express');
const router = express.Router();
const upload = require('../../utils/multer');
const userModel = require('../../controllers/userController');

router.post('/', upload.single('image'), userModel.registerUser);
router.get('/:id', userModel.viewProfile);
router.put('/:id', upload.single('image'), userModel.updateProfile);

module.exports = router;
