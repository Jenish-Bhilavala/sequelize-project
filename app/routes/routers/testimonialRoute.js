const express = require('express');
const router = express.Router();
const upload = require('../../utils/multer');
const testimonialModel = require('../../controllers/testimonialController');

router.post('/', upload.single('image'), testimonialModel.addTestimonial);
router.get('/', testimonialModel.listTestimonial);
router.get('/view-testimonial/:id', testimonialModel.viewTestimonial);
router.put(
  '/update/:id',
  upload.single('image'),
  testimonialModel.updateTestimonial
);
router.delete('/delete/:id', testimonialModel.deleteTestimonial);

module.exports = router;
